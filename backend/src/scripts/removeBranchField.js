import dotenv from "dotenv";
import connectDB from "../config/dbconnection.js";
import User from "../models/user.model.js";

dotenv.config();

const removeBranchField = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn("MongoDB is not connected. Set MONGO_URI before running this migration.");
    process.exitCode = 1;
    return;
  }

  const result = await User.updateMany(
    { branch: { $exists: true } },
    { $unset: { branch: "" } }
  );

  console.log(
    `Removed branch from ${result.modifiedCount || 0} user document(s).`
  );
};

removeBranchField()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to remove branch field:", error);
    process.exit(1);
  });