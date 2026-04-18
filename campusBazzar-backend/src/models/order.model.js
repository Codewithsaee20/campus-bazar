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

    //listing snapshot at time of purchase
    listingSnapShot: {
        title: { type: String, required: true },
        mrp: { type: Number, required: true },
        price: { type: Number, required: true },
        buyerPrice: { type: Number, required: true },
        platformFee: { type: Number, required: true },
    },

    //college copied from buyer's profile at time of purchase
    college: {
        type: String,
        required: true
    },

    //order lifecycle
    status: {
      type: String,
        enum: [
                    "PENDING_PAYMENT",
        "PAID",
        "MEETUP_SCHEDULED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
        ],
        default: "PENDING_PAYMENT",
    },

      // --- Razorpay references ---
    // razorpayOrderId  → created when we call Razorpay to make a payment order
    // razorpayPaymentId → comes back from Razorpay after buyer pays
    // These are filled in by the Payments module. Null until then.
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // --- OTP Handoff system ---
    // The seller generates this OTP at the meetup point.
    // Buyer types it in to confirm they received the item.
    otpHash: {
      type: String,
      default: null, // null until seller generates it
    },
    otpExpiresAt: {
      type: Date,
      default: null, // null until seller generates it
    },

    // --- Payout tracking ---
    // After OTP verification, we trigger a RazorpayX payout to the seller.
    // This flag prevents double payouts if something is retried.
    payoutReleased: {
      type: Boolean,
      default: false,
    },
    payoutId: {
      type: String,
      default: null, // RazorpayX payout ID, filled after payout succeeds
    },

    // --- Optional: Cancellation reason ---
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast lookup of all orders by buyer or seller
orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerId: 1 });

// Compound index: find all orders in a college (for admin dashboard)
orderSchema.index({ college: 1, status: 1 });

export const Order = mongoose.model("Order", orderSchema);

