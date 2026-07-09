import dotenv from "dotenv";
import connectDB from "../config/dbconnection.js";
import { Category } from "../models/category.model.js";
import { Listing } from "../models/listing.model.js";

dotenv.config();

const migrateNotesAndMergeLabCoats = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn("MongoDB is not connected. Set MONGO_URI before running this migration.");
    process.exitCode = 1;
    return;
  }

  await Category.findOneAndUpdate(
    { slug: "notes" },
    { $set: { name: "Notes", slug: "notes" }, $setOnInsert: { isActive: true } },
    { upsert: true }
  );
  console.log('Ensured "Notes" category exists.');

  const stationery = await Category.findOne({ slug: "stationery" });
  const labCoats = await Category.findOne({ slug: "lab-coats" });

  if (!stationery) {
    throw new Error('"Stationery" category not found — run the earlier category migration first.');
  }

  if (labCoats) {
    const reassignResult = await Listing.updateMany(
      { categoryId: labCoats._id },
      { $set: { categoryId: stationery._id } }
    );
    console.log(`Reassigned ${reassignResult.modifiedCount || 0} listing(s) from "Lab Coats" to "Stationery".`);

    await Category.deleteOne({ _id: labCoats._id });
    console.log('Removed "Lab Coats" category — merged into "Stationery".');
  } else {
    console.log('No "Lab Coats" category found — nothing to merge.');
  }

  const remaining = await Category.find().sort({ name: 1 });
  console.log(`Categories now: ${remaining.map((c) => c.name).join(", ")}`);
};

migrateNotesAndMergeLabCoats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to migrate notes/lab-coats categories:", error);
    process.exit(1);
  });
