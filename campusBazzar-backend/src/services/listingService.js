import { Listing } from "../models/listing.model.js";
import { Order } from "../models/order.model.js";
import { getSuggestedPrice } from "../utils/pricing.js";
import { ApiError } from "../utils/ApiError.js";

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

  const listing = await Listing.create({
    ...data,
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
      listing[field] = field === "price" ? Number(data[field]) : data[field];
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

export { createListing, getListings, getListingById, updateListing, deleteListing };
