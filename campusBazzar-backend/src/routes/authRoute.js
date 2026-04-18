import express from "express";
import {
    sendOTPHandler,
    verifyOTPHandler,
    logout,
    refresh,
    getProfile
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /auth/send-otp
router.post("/send-otp", sendOTPHandler);

// POST /auth/verify-otp
router.post("/verify-otp", verifyOTPHandler);

// POST /auth/logout (protected)
router.post("/logout", verifyToken, logout);

// POST /auth/refresh
router.post("/refresh", refresh);

// GET /auth/me (protected)
router.get("/me", verifyToken, getProfile);

export default router;