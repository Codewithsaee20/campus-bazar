import { Book } from "../models/book.model.js";
import { ApiError } from "../utils/ApiError.js";

const findOrCreateBook = async ({ title, isbn, originalMrp }) => {
  if (typeof title !== "string" || title.trim() === "") {
    throw new ApiError(400, "title and originalMrp are required");
  }

  if (!Number.isFinite(originalMrp)) {
    throw new ApiError(400, "title and originalMrp are required");
  }

  if (isbn !== undefined && isbn !== null && typeof isbn !== "string") {
    throw new ApiError(400, "isbn must be a string");
  }

  const bookId = isbn ? isbn : `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const book = await Book.findOneAndUpdate(
    { bookId },
    {
      $setOnInsert: {
        bookId,
        title,
        isbn,
        originalMrp,
        totalResales: 0,
        mrpLocked: false,
      },
    },
    { new: true, upsert: true }
  );

  return book;
};

const incrementResales = async (bookId) => {
  const updatedBook = await Book.findOneAndUpdate(
    { bookId },
    { $inc: { totalResales: 1 } },
    { new: true }
  );

  if (!updatedBook) {
    throw new ApiError(404, "Book not found");
  }

  return updatedBook;
};

export { findOrCreateBook, incrementResales };
