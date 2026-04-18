import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as interestService from "../services/interestService.js";

const createInterest = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) {
    throw new ApiError(400, "Listing ID is required");
  }

  const interest = await interestService.createInterest(
    listingId,
    req.user._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, { interest }, "Interest sent successfully"));
});

const getMyInterests = asyncHandler(async (req, res) => {
  const interests = await interestService.getMyInterests(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { interests }, "Interests fetched successfully"));
});

const getMySentInterests = asyncHandler(async (req, res) => {
  const interests = await interestService.getMySentInterests(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { interests }, "Interests fetched successfully"));
});

const acceptInterest = asyncHandler(async (req, res) => {
  const interestId = req.params.id;
  const interest = await interestService.acceptInterest(
    interestId,
    req.user._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { interest }, "Interest accepted successfully"));
});

const rejectInterest = asyncHandler(async (req, res) => {
  const interestId = req.params.id;
  const interest = await interestService.rejectInterest(
    interestId,
    req.user._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { interest }, "Interest rejected successfully"));
});

export {
  createInterest,
  getMyInterests,
  getMySentInterests,
  acceptInterest,
  rejectInterest,
};
