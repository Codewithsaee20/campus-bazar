import { Router } from "express";
import { createListing, getAllListings, getListingById, updateListing, deleteListing } from "../controllers/listingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadImages } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/", verifyToken, uploadImages, createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.put("/:id", verifyToken, uploadImages, updateListing);
router.delete("/:id", verifyToken, deleteListing);

export default router;
