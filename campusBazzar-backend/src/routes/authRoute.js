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

const router = express.Router();

router.post("/register", register);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/logout", verifyToken, logout);
router.post("/refresh", refreshToken);
router.get("/me", verifyToken, getProfile);

export default router;