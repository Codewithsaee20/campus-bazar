import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    originalMrp: {
      type: Number,
      required: true,
      min: 0,
    },
    totalResales: {
      type: Number,
      default: 0,
      min: 0,
    },
    mrpLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);