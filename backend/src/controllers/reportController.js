import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as reportService from "../services/reportService.js";

const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, reason, listingId } = req.body;

  if (!reportedUserId || !reason) {
    throw new ApiError(400, "reportedUserId and reason are required");
  }

  await reportService.createReport(
    req.user._id,
    reportedUserId,
    reason,
    listingId
  );

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Report submitted successfully"));
});

const getAllReports = asyncHandler(async (req, res) => {
  const reports = await reportService.getAllReports();

  return res
    .status(200)
    .json(new ApiResponse(200, { reports }, "Reports fetched successfully"));
});

export { createReport, getAllReports };
