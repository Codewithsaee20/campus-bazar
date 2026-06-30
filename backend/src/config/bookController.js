import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Book } from "../models/book.model.js";
import * as bookService from "../services/bookService.js";

const findOrCreateBook = asyncHandler(async (req, res) => {
  const { title, isbn, originalMrp } = req.body;

  if (!title || originalMrp === undefined || originalMrp === null) {
    throw new ApiError(400, "title and originalMrp are required");
  }

  const book = await bookService.findOrCreateBook({ title, isbn, originalMrp });

  return res
    .status(200)
    .json(new ApiResponse(200, { book }, "Book fetched successfully"));
});

const getBookById = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findOne({ bookId });

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { book }, "Book fetched successfully"));
});

const searchBooks = asyncHandler(async (req, res) => {
  const q = req.query.q?.toString().trim();

  if (!q) {
    throw new ApiError(400, "Search query required");
  }

  let books;
  try {
    books = await Book.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
  } catch {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    books = await Book.find({ title: regex }).limit(10);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { books }, "Books fetched successfully"));
});

export { findOrCreateBook, getBookById, searchBooks };
