import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Health Check
const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "ok",
            "API is healthy and running"
        )
    )
})

export { healthCheck }
