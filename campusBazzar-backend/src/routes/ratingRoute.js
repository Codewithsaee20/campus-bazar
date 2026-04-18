import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createRating, getUserRatings } from "../controllers/ratingController.js";

const router = Router();

// POST /api/v1/ratings — protected
router.post("/", verifyToken, createRating);

// GET /api/v1/ratings/users/:id — public
router.get("/users/:id", getUserRatings);

export default router;
