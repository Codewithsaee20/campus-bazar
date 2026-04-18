import * as orderService from "../services/orderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//orders
//buyer creating order
const createOrder = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const order = await orderService.createOrder(req.user._id, listingId);

  return res
  .status(201)
  .json(new ApiResponse(201, order, "Order created successfully"));
});

//get orders/my/buying
//buyer sees all order he made
const getMyBuyingOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getBuyerOrders(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Your buying orders fetched successfully"));
});

//get orders/my/selling
//seller sees all order he received
const getMySellingOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getSellerOrders(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Your selling orders fetched successfully"));
});

//get orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);

  return res
  .status(200)
  .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// PATCH /api/v1/orders/:id/cancel
// Buyer cancels an order that hasn't been paid yet
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await orderService.cancelOrder(req.params.id, req.user._id, reason);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// POST /api/v1/orders/:id/otp/generate
// Seller generates a handoff OTP at the meetup point
const generateOtp = asyncHandler(async (req, res) => {
  const { otp, otpExpiresAt } = await orderService.generateOtp(req.params.id, req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        otp,
        expiresAt: otpExpiresAt,
      },
      "OTP generated. Share this with the buyer at the meetup."
    )
  );
});

// POST /api/v1/orders/:id/otp/verify
// Buyer enters OTP to confirm item received
const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const order = await orderService.verifyOtp(req.params.id, req.user._id, otp);

  return res
    .status(200)
    .json(
      new ApiResponse(200, order, "OTP verified. Transaction complete!")
    );
});

export  {
  createOrder,
  getMyBuyingOrders,
  getMySellingOrders,
  getOrderById,
  cancelOrder,
  generateOtp,
  verifyOtp,
};