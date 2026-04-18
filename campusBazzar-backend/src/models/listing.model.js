import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    // who is selling
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },

    // ref to Category collection
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // seller enters this — shown as strikethrough on frontend
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    // server-calculated: mrp × 0.60 — what seller receives
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // server-calculated: price + ₹10 — what buyer pays
    buyerPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // always ₹10 — platform cut
    platformFee: {
      type: Number,
      required: true,
      default: 10,
    },

    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Worn'],
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images allowed',
      },
    },

    status: {
      type: String,
      enum: ['Active', 'Sold', 'Removed'],
      default: 'Active',
    },

    // inherited from seller's JWT — never from client input
    college: {
      type: String,
      required: true,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// indexes
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ categoryId: 1 });
listingSchema.index({ college: 1, status: 1 });
listingSchema.index({ sellerId: 1 });
listingSchema.index({ buyerPrice: 1 });

export const Listing = mongoose.model('Listing', listingSchema);