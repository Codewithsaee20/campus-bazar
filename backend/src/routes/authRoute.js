import express from "express";
import {
    register,
    sendOTP,
    verifyOTP,
    logout,
    refreshToken,
    getProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/send-otp", otpLimiter, sendOTP);
router.post("/verify-otp", otpLimiter, verifyOTP);
router.post("/logout", verifyToken, logout);
router.post("/refresh", authLimiter, refreshToken);
router.get("/me", verifyToken, getProfile);
router.get("/profile", verifyToken, getProfile);

export default router;