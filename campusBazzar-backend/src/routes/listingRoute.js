import { Router } from "express";
import { createListing, getAllListings, getListingById, updateListing, deleteListing } from "../controllers/listingController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", verifyToken, createListing);
router.get("/", getAllListings);
router.get("/:id", getListingById);
router.put("/:id", verifyToken, updateListing);
router.delete("/:id", verifyToken, deleteListing);

export default router;
