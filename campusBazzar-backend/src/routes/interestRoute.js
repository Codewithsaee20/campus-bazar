import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createInterest,
  getMyInterests,
  getMySentInterests,
  acceptInterest,
  rejectInterest,
} from "../controllers/interestController.js";

const router = Router();

// All routes use verifyToken middleware
router.use(verifyToken);

router.post("/", createInterest);
router.get("/my/buying", getMyInterests);
router.get("/my/selling", getMySentInterests);
router.patch("/:id/accept", acceptInterest);
router.patch("/:id/reject", rejectInterest);

export default router;
