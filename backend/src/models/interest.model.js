import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

interestSchema.index({ listingId: 1, buyerId: 1, status: 1 });
interestSchema.index({ sellerId: 1, status: 1 });

export const Interest = mongoose.model("Interest", interestSchema);
