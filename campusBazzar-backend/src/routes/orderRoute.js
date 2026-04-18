import { createOrder,
  getMyBuyingOrders,
  getMySellingOrders,
  getOrderById,
  cancelOrder,
  generateOtp,
  verifyOtp } from "../controllers/orderController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//will use auth for all order related routes
router.use(verifyToken);

// ── List routes (before /:id to avoid param collision) ──
router.get("/my/buying", getMyBuyingOrders);
router.get("/my/selling", getMySellingOrders);

// ── CRUD ────────────────────────────────────────────────
router.post("/", createOrder);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

// ── OTP handoff ─────────────────────────────────────────
router.post("/:id/otp/generate", generateOtp);
router.post("/:id/otp/verify", verifyOtp);

export default router;