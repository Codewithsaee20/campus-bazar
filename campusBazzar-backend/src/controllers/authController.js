import {
  registerUser,
  sendOTP as sendOTPService,
  verifyOTP as verifyOTPService,
  logoutUser,
  refreshUserAccessToken,
  getProfileById,
} from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, department, branch } = req.body;

  if (!name || !email || !phone || !department || !branch) {
    throw new ApiError(
      400,
      "Name, email, phone, department and branch are required"
    );
  }

  await registerUser(name, email, phone, department, branch);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "OTP sent to your college email"));
});

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  await sendOTPService(email);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to your college email"));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and otp are required");
  }

  const { user, accessToken, refreshToken } = await verifyOTPService(email, otp);

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, { user, accessToken }, "Logged in successfully")
    );
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", baseCookieOptions)
    .clearCookie("refreshToken", baseCookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const { accessToken } = await refreshUserAccessToken(incomingRefreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .json(
      new ApiResponse(200, { accessToken }, "Token refreshed successfully")
    );
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileById(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

export { register, sendOTP, verifyOTP, logout, refreshToken, getProfile };
