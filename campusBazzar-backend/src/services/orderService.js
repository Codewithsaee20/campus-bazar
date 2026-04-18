import crypto from "crypto";
import nodemailer from "nodemailer";
import { Order } from "../models/order.model.js";
import { Listing } from "../models/listing.model.js";
import { Book } from "../models/book.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const sellerBuyerPopulate = {
  path: "buyerId",
  select: "name phone department branch email college",
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

const notifySellerListingBooked = async ({ sellerEmail, sellerName, buyerName, title }) => {
  if (!orderMailTransporter || !sellerEmail) return;

  await orderMailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: sellerEmail,
    subject: "CampusBazar - Your listing is booked",
    html: `
      <h2>Hello ${sellerName || "Seller"},</h2>
      <p>Your listing has been booked by a buyer.</p>
      <p><strong>Book:</strong> ${title}</p>
      <p><strong>Buyer:</strong> ${buyerName || "A CampusBazar user"}</p>
      <p>Please open your selling orders to view buyer details and coordinate cash on delivery.</p>
    `,
  });
};

const createOrder = async (buyerId, listingId) => {
  if (!listingId) {
    throw new ApiError(400, "listingId is required", "MISSING_LISTING_ID");
  }

  const existingOrder = await Order.findOne({
    listingId,
    status: { $in: ["PENDING", "ACCEPTED"] },
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
    const [seller, buyer] = await Promise.all([
      User.findById(listing.sellerId).select("email name"),
      User.findById(buyerId).select("name"),
    ]);

    await notifySellerListingBooked({
      sellerEmail: seller?.email,
      sellerName: seller?.name,
      buyerName: buyer?.name,
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

const generateOtp = async (orderId, sellerId) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  if (String(order.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Only seller can generate OTP", "UNAUTHORIZED");
  }

  if (order.status !== "ACCEPTED") {
    throw new ApiError(400, "OTP can only be generated for accepted orders", "INVALID_STATUS");
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  order.otp = otp;
  order.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await order.save();

  return {
    otp,
    otpExpiresAt: order.otpExpiresAt,
  };
};

const verifyOtp = async (orderId, buyerId, otp) => {
  if (!orderId) {
    throw new ApiError(400, "orderId is required", "MISSING_ORDER_ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  if (String(order.buyerId) !== String(buyerId)) {
    throw new ApiError(403, "Only buyer can verify OTP", "UNAUTHORIZED");
  }

  if (order.status !== "ACCEPTED") {
    throw new ApiError(400, "Only accepted orders can be completed", "INVALID_STATUS");
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
  return Order.find({ sellerId })
    .populate(sellerBuyerPopulate)
    .sort({ createdAt: -1 });
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
    return order.populate(sellerBuyerPopulate);
  }

  return order;
};

export {
  createOrder,
  acceptOrder,
  cancelOrder,
  generateOtp,
  verifyOtp,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
};
