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

    bookId: {
      type: String,
      required: true,
      trim: true,
    },

    isbn: {
      type: String,
      trim: true,
      default: null,
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

    // server-calculated: resale price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    suggestedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sourceOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    mrpLocked: {
      type: Boolean,
      default: false,
    },

    flaggedForReview: {
      type: Boolean,
      default: false,
    },

    department: {
      type: String,
      trim: true,
    },

    semester: {
      type: String,
      trim: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Worn'],
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          public_id: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Maximum 5 images allowed',
      },
    },

    status: {
      type: String,
      enum: ['Active', 'Sold'],
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
listingSchema.index({ price: 1 });
listingSchema.index({ bookId: 1 });

export const Listing = mongoose.model('Listing', listingSchema);