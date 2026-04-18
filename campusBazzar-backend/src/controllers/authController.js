import { sendOTP, verifyOTP, getUser, generateTokens } from "../services/authService.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
};

// Send OTP
const sendOTPHandler = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required", "MISSING_EMAIL");
    }

    const result = await sendOTP(email);

    return res.status(200).json(
        new ApiResponse(200, { email }, result.message)
    );
});

// Verify OTP
const verifyOTPHandler = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required", "MISSING_CREDENTIALS");
    }

    const result = await verifyOTP(email, otp);

    return res
        .status(200)
        .cookie("accessToken", result.accessToken, cookieOptions)
        .cookie("refreshToken", result.refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, {
                user: result.user,
                accessToken: result.accessToken
            }, "OTP verified successfully")
        );
});

// Logout
const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Clear refreshToken from database
    await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Refresh access token
const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not found", "NO_REFRESH_TOKEN");
    }

    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);

        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // Update refreshToken in database
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { accessToken }, "Token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token", "TOKEN_VERIFICATION_FAILED");
    }
});

// Get Profile (protected)
const getProfile = asyncHandler(async (req, res) => {
    const user = await getUser(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

export {
    sendOTPHandler,
    verifyOTPHandler,
    logout,
    refresh,
    getProfile
};