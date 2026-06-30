import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authMiddleware.js";
import { createReport, getAllReports } from "../controllers/reportController.js";

const router = Router();

// POST /api/v1/reports — any authenticated user
router.post("/", verifyToken, createReport);

// GET /api/v1/reports — admin only
router.get("/", verifyToken, authorizeRoles("admin"), getAllReports);

export default router;
