import dotenv from "dotenv";
import connectDB from "../config/dbconnection.js";
import { Category } from "../models/category.model.js";
import { Listing } from "../models/listing.model.js";

dotenv.config();

const NEW_CATEGORIES = [
  { name: "Books", slug: "books" },
  { name: "Stationery", slug: "stationery" },
  { name: "Lab Coats", slug: "lab-coats" },
];

const FALLBACK_SLUG = "books";

const migrateEngineeringCategories = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn("MongoDB is not connected. Set MONGO_URI before running this migration.");
    process.exitCode = 1;
    return;
  }

  const upsertedCategories = await Promise.all(
    NEW_CATEGORIES.map((category) =>
      Category.findOneAndUpdate(
        { slug: category.slug },
        { $set: category, $setOnInsert: { isActive: true } },
        { upsert: true, new: true }
      )
    )
  );

  const fallbackCategory = upsertedCategories.find((c) => c.slug === FALLBACK_SLUG);
  const keepIds = upsertedCategories.map((c) => c._id.toString());

  const staleCategories = await Category.find({ _id: { $nin: keepIds } });

  if (staleCategories.length > 0) {
    const staleIds = staleCategories.map((c) => c._id);

    const reassignResult = await Listing.updateMany(
      { categoryId: { $in: staleIds } },
      { $set: { categoryId: fallbackCategory._id, flaggedForReview: true } }
    );

    console.log(
      `Reassigned ${reassignResult.modifiedCount || 0} listing(s) from removed categories to "${fallbackCategory.name}" and flagged them for review.`
    );

    const deleteResult = await Category.deleteMany({ _id: { $in: staleIds } });
    console.log(`Removed ${deleteResult.deletedCount || 0} stale categor${deleteResult.deletedCount === 1 ? "y" : "ies"}: ${staleCategories.map((c) => c.name).join(", ")}`);
  } else {
    console.log("No stale categories to remove.");
  }

  console.log(`Categories now: ${upsertedCategories.map((c) => c.name).join(", ")}`);
};

migrateEngineeringCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to migrate categories:", error);
    process.exit(1);
  });
