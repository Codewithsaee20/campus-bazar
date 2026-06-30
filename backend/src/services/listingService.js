import mongoose from "mongoose";
import { Listing } from "../models/listing.model.js";
import { Order } from "../models/order.model.js";
import { Category } from "../models/category.model.js";
import { getSuggestedPrice } from "../utils/pricing.js";
import { ApiError } from "../utils/ApiError.js";

const resolveCategoryId = async (categoryId) => {
  if (categoryId === undefined || categoryId === null || categoryId === "") {
    throw new ApiError(400, "Category is required", "INVALID_CATEGORY");
  }

  const rawValue = String(categoryId).trim();

  if (mongoose.Types.ObjectId.isValid(rawValue)) {
    const category = await Category.findOne({ _id: rawValue, isActive: true });
    if (category) {
      return category._id;
    }
  }

  const slug = rawValue.toLowerCase();
  const categoryBySlug = await Category.findOne({ slug, isActive: true });
  if (categoryBySlug) {
    return categoryBySlug._id;
  }

  const escapedName = rawValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const categoryByName = await Category.findOne({
    name: new RegExp(`^${escapedName}$`, "i"),
    isActive: true,
  });
  if (categoryByName) {
    return categoryByName._id;
  }

  throw new ApiError(
    400,
    "Invalid category. Choose a category from the list.",
    "INVALID_CATEGORY"
  );
};

const getCompletedResaleCount = async (bookId) => {
  return Order.countDocuments({
    status: "COMPLETED",
    bookId: bookId,
  });
};

const createListing = async (data, userId, college) => {
  const mrp = Number(data.mrp);
  const resaleCount = await getCompletedResaleCount(data.bookId);
  const suggestedPrice = getSuggestedPrice(mrp, resaleCount);
  const categoryId = await resolveCategoryId(data.categoryId);

  const listing = await Listing.create({
    ...data,
    categoryId,
    mrp,
    price: data.price !== undefined ? Number(data.price) : suggestedPrice,
    suggestedPrice,
    sellerId: userId,
    college,
  });

  return listing;
};

const getListings = async (filters = {}, college) => {
  const {
    department,
    semester,
    subject,
    minPrice,
    maxPrice,
  } = filters;

  const query = {
    status: "Active",
  };

  if (college) query.college = college;
  if (department) query.department = department;
  if (semester) query.semester = semester;
  if (subject) query.subject = subject;

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  return Listing.find(query).sort({ createdAt: -1 });
};

const getListingById = async (id) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
  }

  return listing;
};

const getMyListingById = async (id, userId) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
  }

  if (String(listing.sellerId) !== String(userId)) {
    throw new ApiError(403, "Not authorized to view this listing", "NOT_AUTHORIZED");
  }

  return listing;
};

const updateListing = async (id, userId, data) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
  }

  if (String(listing.sellerId) !== String(userId)) {
    throw new ApiError(403, "Not authorized to update this listing", "NOT_AUTHORIZED");
  }

  if (data.mrp !== undefined) {
    const mrp = Number(data.mrp);
    const bookId = data.bookId || listing.bookId;
    const resaleCount = await getCompletedResaleCount(bookId);
    const suggestedPrice = getSuggestedPrice(mrp, resaleCount);

    listing.mrp = mrp;
    listing.suggestedPrice = suggestedPrice;
    if (data.price === undefined) {
      listing.price = suggestedPrice;
    }
  }

  const updatableFields = [
    "title",
    "description",
    "categoryId",
    "price",
    "department",
    "semester",
    "subject",
    "condition",
    "images",
    "status",
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      if (field === "categoryId") {
        listing.categoryId = await resolveCategoryId(data.categoryId);
      } else {
        listing[field] = field === "price" ? Number(data[field]) : data[field];
      }
    }
  }

  await listing.save();
  return listing;
};

const deleteListing = async (id, userId) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
  }

  if (String(listing.sellerId) !== String(userId)) {
    throw new ApiError(403, "Not authorized to delete this listing", "NOT_AUTHORIZED");
  }

  await Listing.deleteOne({ _id: id });
};

export { createListing, getListings, getListingById, getMyListingById, updateListing, deleteListing };
