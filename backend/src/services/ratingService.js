import { Rating } from "../models/rating.model.js";
import { Order } from "../models/order.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const createRating = async (fromUserId, toUserId, listingId, rating, review) => {
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  if (String(fromUserId) === String(toUserId)) {
    throw new ApiError(400, "You cannot rate yourself");
  }

  const completedOrder = await Order.findOne({
    listingId,
    status: "COMPLETED",
    $or: [{ buyerId: fromUserId }, { sellerId: fromUserId }],
  });

  if (!completedOrder) {
    throw new ApiError(403, "You can only rate after a completed transaction");
  }

  const existingRating = await Rating.findOne({ fromUserId, listingId });

  if (existingRating) {
    throw new ApiError(400, "You have already rated this transaction");
  }

  const newRating = await Rating.create({
    fromUserId,
    toUserId,
    listingId,
    rating,
    review,
  });

  const toUser = await User.findById(toUserId);
  if (toUser) {
    await toUser.updateRating(rating);
  }

  return newRating;
};

const getUserRatings = async (userId) => {
  return Rating.find({ toUserId: userId })
    .populate("fromUserId", "name profilePic college")
    .sort({ createdAt: -1 });
};

export { createRating, getUserRatings };
