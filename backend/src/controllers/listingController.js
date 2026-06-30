import {
    createListing as createListingService,
    getListings,
    getListingById as getListingByIdService,
    getMyListingById as getMyListingByIdService,
    updateListing as updateListingService,
    deleteListing as deleteListingService,
} from "../services/listingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createListing = asyncHandler(async (req, res) => {
    const allowedFields = ['title', 'bookId', 'description', 'categoryId', 'price', 'mrp', 'condition', 'department', 'semester', 'subject', 'isbn'];
    const payload = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    });

    if (Array.isArray(req.uploadedImages) && req.uploadedImages.length > 0) {
        payload.images = req.uploadedImages;
    }

    const listing = await createListingService(payload, req.user._id, req.user.college);

    return res
        .status(201)
        .json(new ApiResponse(201, listing, "Listing created successfully"));
});

const getAllListings = asyncHandler(async (req, res) => {
    const listings = await getListings({
        department: req.query.department,
        semester: req.query.semester,
        subject: req.query.subject,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
    }, req.user?.college);

    return res
        .status(200)
        .json(new ApiResponse(200, listings, "Listings retrieved successfully"));
});

const getListingById = asyncHandler(async (req, res) => {
    const listing = await getListingByIdService(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, listing, "Listing retrieved successfully"));
});

    const getMyListingById = asyncHandler(async (req, res) => {
        const listing = await getMyListingByIdService(req.params.id, req.user._id);

        return res
        .status(200)
        .json(new ApiResponse(200, listing, "Your listing retrieved successfully"));
    });

const updateListing = asyncHandler(async (req, res) => {
    const allowedFields = ['title', 'bookId', 'description', 'categoryId', 'price', 'mrp', 'condition', 'department', 'semester', 'subject', 'isbn', 'status'];
    const payload = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    });

    if (Array.isArray(req.uploadedImages) && req.uploadedImages.length > 0) {
        payload.images = req.uploadedImages;
    }

    const listing = await updateListingService(req.params.id, req.user._id, payload);

    return res
        .status(200)
        .json(new ApiResponse(200, listing, "Listing updated successfully"));
});

const deleteListing = asyncHandler(async (req, res) => {
    await deleteListingService(req.params.id, req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Listing deleted successfully"));
});

export {
    createListing,
    getAllListings,
    getListingById,
    getMyListingById,
    updateListing,
    deleteListing,
};