import {} from '../services/listingService.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createListing = asyncHandler(async (req,res) => {
    
    const sellerId = req.user._id;
    const college = req.user.college;

    const listing = await listingService.createListing({...req.body, sellerId, college});

    res.status(201).json(new ApiResponse(201, 'Listing created successfully', listing));

})

const getAllListings = asyncHandler(async (req,res) => {
    const college = req.user.college;

    const listings = await listingService.getAllListings(req.params.id, college);

    res.json(new ApiResponse(200, 'Listings retrieved successfully', listings));
})

const getListingById = asyncHandler(async (req,res) => {
    const sellerId = req.user._id;

    const result = await listingService.getListingById(req.params.id, sellerId);

    if (!result) {
        throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }

    res.json(new ApiResponse(200, 'Listing retrieved successfully', result));
})

const updateListing = asyncHandler(async (req,res) => {
    const sellerId = req.user._id;

    const listing = await listingService.updateListing(req.params.id, req.body, sellerId);

    if (!listing) {
        throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }

    res.json(new ApiResponse(200, 'Listing updated successfully', listing));
})

const deleteListing = asyncHandler(async (req,res) => {
    const sellerId = req.user._id;

    await listingService.deleteListing(req.params.id, sellerId);
    res.json(new ApiResponse(200, 'Listing deleted successfully'));
})

export {
    createListing,
    getAllListings,
    getListingById,
    updateListing,
    deleteListing
}