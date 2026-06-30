import { Report } from "../models/report.model.js";
import User from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";

const createReport = async (reportedBy, reportedUserId, reason, listingId) => {
  if (String(reportedBy) === String(reportedUserId)) {
    throw new ApiError(400, "You cannot report yourself");
  }

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    throw new ApiError(404, "User not found");
  }

  if (listingId) {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
  }

  const query = { reportedBy, reportedUserId };
  if (listingId) {
    query.listingId = listingId;
  }

  const existingReport = await Report.findOne(query);
  if (existingReport) {
    throw new ApiError(400, "You have already reported this");
  }

  const report = await Report.create({
    reportedBy,
    reportedUserId,
    reason,
    ...(listingId && { listingId }),
  });

  return report;
};

const getAllReports = async () => {
  return Report.find()
    .populate("reportedUserId", "name email college")
    .populate("reportedBy", "name email")
    .populate("listingId", "title")
    .sort({ createdAt: -1 });
};

export { createReport, getAllReports };
