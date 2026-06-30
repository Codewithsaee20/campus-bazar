import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as ratingService from "../services/ratingService.js";

const createRating = asyncHandler(async (req, res) => {
  const { toUserId, listingId, rating, review } = req.body;

  if (!toUserId || !listingId || rating === undefined) {
    throw new ApiError(400, "toUserId, listingId and rating are required");
  }

  const newRating = await ratingService.createRating(
    req.user._id,
    toUserId,
    listingId,
    rating,
    review
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { rating: newRating }, "Rating submitted successfully"));
});

const getUserRatings = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const ratings = await ratingService.getUserRatings(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, { ratings }, "Ratings fetched successfully"));
});

export { createRating, getUserRatings };
