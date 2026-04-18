import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyerId: {
    type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    sellerId: {
    type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    //lisitng being purchased
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },

    bookId: {
      type: String,
      default: null,
      index: true,
    },

    //listing snapshot at time of purchase
    listingSnapshot: {
        title: { type: String, required: true },
        mrp: { type: Number, required: true },
        price: { type: Number, required: true },
    },

    //college copied from buyer's profile at time of purchase
    college: {
        type: String,
        required: true
    },

    //order lifecycle
    status: {
      type: String,
        enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
        default: "PENDING",
    },

    // --- OTP Handoff system ---
    // The seller generates this OTP at the meetup point.
    // Buyer types it in to confirm they received the item.
    otp: {
      type: String,
      default: null, // null until seller generates it
    },
    otpExpiresAt: {
      type: Date,
      default: null, // null until seller generates it
    },

    payoutReleased: {
      type: Boolean,
      default: false,
    },
    payoutId: {
      type: String,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup of all orders by buyer or seller
orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerId: 1 });

// Compound index: find all orders in a college (for admin dashboard)
orderSchema.index({ college: 1, status: 1 });

orderSchema.index(
  { listingId: 1, status: 1 },
  {
    unique: false,
    partialFilterExpression: {
      status: { $in: ["PENDING", "ACCEPTED"] }
    },
    name: "one_active_order_per_listing"
  }
);

export const Order = mongoose.model("Order", orderSchema);

