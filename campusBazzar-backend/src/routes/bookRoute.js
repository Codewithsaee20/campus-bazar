import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  searchBooks,
  findOrCreateBook,
  getBookById,
} from "../controllers/bookController.js";

const router = Router();

router.post("/search", verifyToken, searchBooks);
router.post("/find-or-create", verifyToken, findOrCreateBook);
router.get("/:bookId", getBookById);

export default router;
