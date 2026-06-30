import { Interest } from "../models/interest.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";

const createInterest = async (listingId, buyerId) => {
  const listing = await Listing.findById(listingId);
  
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.status !== "Active") {
    throw new ApiError(400, "Listing is no longer available");
  }

  if (String(listing.sellerId) === String(buyerId)) {
    throw new ApiError(400, "You cannot show interest in your own listing");
  }

  const existingInterest = await Interest.findOne({
    listingId,
    buyerId,
    status: "pending",
  });

  if (existingInterest) {
    throw new ApiError(400, "You already showed interest in this listing");
  }

  const interest = await Interest.create({
    listingId,
    buyerId,
    sellerId: listing.sellerId,
    status: "pending",
  });

  return interest;
};

const getMyInterests = async (userId) => {
  return Interest.find({ buyerId: userId })
    .populate("listingId", "title price condition images")
    .populate("sellerId", "name college rating");
};

const getMySentInterests = async (userId) => {
  return Interest.find({ sellerId: userId })
    .populate("listingId", "title price condition images")
    .populate("buyerId", "name college rating");
};

const acceptInterest = async (interestId, sellerId) => {
  const interest = await Interest.findById(interestId);

  if (!interest) {
    throw new ApiError(404, "Interest not found");
  }

  if (String(interest.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Not authorized");
  }

  if (interest.status !== "pending") {
    throw new ApiError(400, "Interest is no longer pending");
  }

  interest.status = "accepted";
  await interest.save();

  // Reject all other pending interests for same listingId
  await Interest.updateMany(
    {
      listingId: interest.listingId,
      _id: { $ne: interestId },
      status: "pending",
    },
    { status: "rejected" }
  );

  return interest;
};

const rejectInterest = async (interestId, sellerId) => {
  const interest = await Interest.findById(interestId);

  if (!interest) {
    throw new ApiError(404, "Interest not found");
  }

  if (String(interest.sellerId) !== String(sellerId)) {
    throw new ApiError(403, "Not authorized");
  }

  if (interest.status !== "pending") {
    throw new ApiError(400, "Interest is no longer pending");
  }

  interest.status = "rejected";
  await interest.save();

  return interest;
};

export {
  createInterest,
  getMyInterests,
  getMySentInterests,
  acceptInterest,
  rejectInterest,
};
