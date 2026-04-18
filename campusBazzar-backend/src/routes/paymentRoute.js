import express from "express";
import { initiatePayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/create-order", verifyToken, initiatePayment);

export default router;