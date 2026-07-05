import crypto from "crypto";
import nodemailer from "nodemailer";
import { Order } from "../models/order.model.js";
import { Listing } from "../models/listing.model.js";
import { Book } from "../models/book.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const sellerBuyerPopulate = {
  path: "buyerId",
  select: "name phone department email college",
};

const orderMailTransporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : null;

// Note: buyer identity must stay hidden from the seller until the order is
// ACCEPTED, so this notification intentionally omits the buyer's name.
const notifySellerListingBooked = async ({ sellerEmail, sellerName, title }) => {
  if (!orderMailTransporter || !sellerEmail) return;

  await orderMailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: "CampusBazar - New order request",
    html: `
      <h2>Hello ${sellerName || "Seller"},</h2>
      <p>You have a new order request for your listing.</p>
      <p><strong>Book:</strong> ${title}</p>
      <p>Open your selling orders to accept or deny this request.</p>
    `,
  });
};

const notifyBuyerOrderAccepted = async ({ buyerEmail, buyerName, title }) => {
  if (!orderMailTransporter || !buyerEmail) return;

  await orderMailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: "CampusBazar - Your order was accepted",
    html: `
      <h2>Hello ${buyerName || "Buyer"},</h2>
      <p>The seller accepted your order for <strong>${title}</strong>.</p>
      <p>They will mark it as delivered once you receive the item.</p>
    `,
  });
};

const notifyBuyerDeliveryMarked = async ({ buyerEmail, buyerName, title }) => {
  if (!orderMailTransporter || !buyerEmail) return;

  await orderMailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: "CampusBazar - Delivery marked, please confirm",
    html: `
      <h2>Hello ${buyerName || "Buyer"},</h2>
      <p>The seller marked <strong>${title}</strong> as delivered.</p>
      <p>Please confirm delivery in the app once you have received it.</p>
    `,
  });
};

// No SMS gateway is configured in this codebase yet. The OTP is delivered to
// the buyer via email as a stand-in for "buyer's phone" until SMS is wired up.
const sendOtpToBuyer = async ({ buyerEmail, buyerName, title, otp }) => {
  if (!orderMailTransporter || !buyerEmail) return;

  await orderMailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: buyerEmail,
    subject: "CampusBazar - Your handoff OTP",
    html: `
      <h2>Hello ${buyerName || "Buyer"},</h2>
      <p>Your OTP for <strong>${title}</strong> is:</p>
      <h1>${otp}</h1>
      <p>Share this code with the seller only after you receive the item. It expires in 10 minutes.</p>
    `,
  });
};

// Hides buyer PII from the seller until the order has been ACCEPTED.
const sanitizeOrderForSeller = (order) => {
  if (!order) return order;
  const plain = typeof order.toObject === "function" ? order.toObject() : order;

  if (plain.status === "PENDING" && plain.buyerId && typeof plain.buyerId === "object") {
    plain.buyerId = { _id: plain.buyerId._id };
  }

  return plain;
};

const ACTIVE_ORDER_STATUSES = ["PENDING", "ACCEPTED", "DELIVERY_MARKED", "DELIVERY_CONFIRMED"];

const createOrder = async (buyerId, listingId) => {
  if (!listingId) {
    throw new ApiError(400, "listingId is required", "MISSING_LISTING_ID");
  }

  const existingOrder = await Order.findOne({
    listingId,
    status: { $in: ACTIVE_ORDER_STATUSES },
  });

  if (existingOrder) {
    throw new ApiError(409, "This listing already has an active order");
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (String(listing.sellerId) === String(buyerId)) {
    throw new ApiError(400, "Cannot create order for your own listing", "INVALID_ACTION");
  }

  if (listing.status !== "Active") {
    throw new ApiError(400, "This listing is no longer available");
  }

  const listingSnapshot = {
    title: listing.title,
    mrp: listing.mrp,
    price: listing.price,
  };

  const order = await Order.create({
    buyerId,
    sellerId: listing.sellerId,
    listingId,
    bookId: listing.bookId,
    listingSnapshot,
    college: listing.college,
    status: "PENDING",
  });

  // Notification should not block order creation.
  try {
    const seller = await User.findById(listing.sellerId).select("email name");

    await notifySellerListingBooked({
      sellerEmail: seller?.email,
      sellerName: seller?.name,
      title: listing.title,
    });
  } catch (error) {
    console.warn("Failed to send listing booked notification:", error.message);
  }

  return order;
};

const acceptOrder = async (orderId, sellerId) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  const listing = await Listing.findById(order.listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
  }

  if (String(listing.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Only listing owner can accept order", "UNAUTHORIZED");
  }

  if (order.status !== "PENDING") {
    throw new ApiError(400, "Only pending orders can be accepted", "INVALID_STATUS");
  }

  order.status = "ACCEPTED";
  await order.save();

  try {
    const buyer = await User.findById(order.buyerId).select("email name");
    await notifyBuyerOrderAccepted({
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      title: order.listingSnapshot?.title,
    });
  } catch (error) {
    console.warn("Failed to send order-accepted notification:", error.message);
  }

  return order.populate(sellerBuyerPopulate);
};

// Seller marks the item as physically delivered to the buyer.
const markDelivered = async (orderId, sellerId) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  if (String(order.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Only seller can mark order as delivered", "UNAUTHORIZED");
  }

  if (order.status !== "ACCEPTED") {
    throw new ApiError(400, "Only accepted orders can be marked as delivered", "INVALID_STATUS");
  }

  order.status = "DELIVERY_MARKED";
  await order.save();

  try {
    const buyer = await User.findById(order.buyerId).select("email name");
    await notifyBuyerDeliveryMarked({
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      title: order.listingSnapshot?.title,
    });
  } catch (error) {
    console.warn("Failed to send delivery-marked notification:", error.message);
  }

  return order;
};

// Buyer confirms they received the item. Backend auto-generates the OTP and
// sends it to the buyer only — the seller never sees or generates it.
const confirmDelivery = async (orderId, buyerId) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  if (String(order.buyerId) !== String(buyerId)) {
    throw new ApiError(403, "Only buyer can confirm delivery", "UNAUTHORIZED");
  }

  if (order.status !== "DELIVERY_MARKED") {
    throw new ApiError(400, "Only orders marked as delivered can be confirmed", "INVALID_STATUS");
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  order.status = "DELIVERY_CONFIRMED";
  order.otp = otp;
  order.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await order.save();

  try {
    const buyer = await User.findById(order.buyerId).select("email name");
    await sendOtpToBuyer({
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      title: order.listingSnapshot?.title,
      otp,
    });
  } catch (error) {
    console.warn("Failed to send OTP to buyer:", error.message);
  }

  return order;
};

const cancelOrder = async (orderId, userId, reason) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  const isBuyer = String(order.buyerId) === String(userId);
  const isSeller = String(order.sellerId) === String(userId);

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, "Not authorized to cancel this order", "UNAUTHORIZED");
  }

  if (order.status === "COMPLETED") {
    throw new ApiError(400, "Completed order cannot be cancelled", "INVALID_STATUS");
  }

  order.status = "CANCELLED";
  order.cancellationReason = reason || null;
  await order.save();

  await Listing.findByIdAndUpdate(order.listingId, { status: "Active" });

  return order;
};

// Seller enters the OTP the buyer read out to them. Buyer never enters an
// OTP in the app; seller never generates one.
const verifyOtp = async (orderId, sellerId, otp) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  if (String(order.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Only seller can verify OTP", "UNAUTHORIZED");
  }

  if (order.status !== "DELIVERY_CONFIRMED") {
    throw new ApiError(400, "OTP can only be verified after buyer confirms delivery", "INVALID_STATUS");
  }

  if (!order.otp || !order.otpExpiresAt) {
    throw new ApiError(400, "OTP not generated for this order", "OTP_NOT_GENERATED");
  }

  if (new Date() > order.otpExpiresAt) {
    throw new ApiError(400, "OTP has expired", "OTP_EXPIRED");
  }

  if (String(order.otp) !== String(otp)) {
    throw new ApiError(400, "Invalid OTP", "INVALID_OTP");
  }

  order.status = "COMPLETED";
  order.otp = null;
  order.otpExpiresAt = null;
  order.payoutReleased = true;
  order.payoutId = `PAYOUT-${order._id}-${Date.now()}`;
  await order.save();

  const listing = await Listing.findByIdAndUpdate(order.listingId, { status: "Sold" });

  const bookIdToUpdate = order.bookId || (listing && listing.bookId);
  if (bookIdToUpdate) {
    const updatedBook = await Book.findOneAndUpdate(
      { bookId: bookIdToUpdate },
      { $inc: { totalResales: 1 } },
      { new: true }
    );

    if (!updatedBook) {
      console.warn('Book not found for resale increment, bookId:', bookIdToUpdate);
    }
  }

  return order;
};

const getBuyerOrders = async (buyerId) => {
  return Order.find({ buyerId }).sort({ createdAt: -1 });
};

const getSellerOrders = async (sellerId) => {
  const orders = await Order.find({ sellerId })
    .populate(sellerBuyerPopulate)
    .sort({ createdAt: -1 });

  return orders.map(sanitizeOrderForSeller);
};

const getOrderById = async (orderId, userId) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  const isBuyer = String(order.buyerId) === String(userId);
  const isSeller = String(order.sellerId) === String(userId);

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, "Not authorized to view this order", "UNAUTHORIZED");
  }

  if (isSeller) {
    await order.populate(sellerBuyerPopulate);
    return sanitizeOrderForSeller(order);
  }

  return order;
};

export {
  createOrder,
  acceptOrder,
  markDelivered,
  confirmDelivery,
  cancelOrder,
  verifyOtp,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
};
