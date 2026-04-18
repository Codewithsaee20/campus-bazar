import { healthCheck } from "../controllers/healthController.js";
import express from "express";

const router = express.Router();

// Health Check Route
router.get("/", healthCheck);

export default router; 
