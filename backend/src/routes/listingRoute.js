import { Router } from "express";
import { createListing, getAllListings, getListingById, getMyListingById, updateListing, deleteListing } from "../controllers/listingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadImages } from "../middleware/uploadMiddleware.js";
import { uploadLimiter, listingLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", verifyToken, listingLimiter, uploadLimiter, uploadImages, createListing);
router.get("/", getAllListings);
router.get("/my/:id", verifyToken, getMyListingById);
router.get("/:id", getListingById);
router.put("/:id", verifyToken, uploadLimiter, uploadImages, updateListing);
router.delete("/:id", verifyToken, deleteListing);

export default router;
