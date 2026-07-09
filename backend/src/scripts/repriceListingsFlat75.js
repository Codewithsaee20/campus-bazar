import dotenv from "dotenv";
import connectDB from "../config/dbconnection.js";
import { Listing } from "../models/listing.model.js";
import { getSuggestedPrice } from "../utils/pricing.js";

dotenv.config();

const repriceListingsFlat75 = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn("MongoDB is not connected. Set MONGO_URI before running this migration.");
    process.exitCode = 1;
    return;
  }

  const listings = await Listing.find({ status: "Active" });
  let updatedCount = 0;

  for (const listing of listings) {
    const suggestedPrice = getSuggestedPrice(listing.mrp);

    if (listing.price !== suggestedPrice || listing.suggestedPrice !== suggestedPrice) {
      listing.price = suggestedPrice;
      listing.suggestedPrice = suggestedPrice;
      await listing.save();
      updatedCount += 1;
    }
  }

  console.log(`Repriced ${updatedCount} of ${listings.length} active listing(s) to 75% of MRP.`);
};

repriceListingsFlat75()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to reprice listings:", error);
    process.exit(1);
  });
