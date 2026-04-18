import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      default: "",
      maxLength: 1000,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ toUserId: 1, createdAt: -1 });
ratingSchema.index({ fromUserId: 1, listingId: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
