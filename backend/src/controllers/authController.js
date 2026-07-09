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

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // Cross-site cookies (Vercel frontend -> Render backend) require SameSite=None + Secure.
  sameSite: isProduction ? "none" : "lax",
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, department } = req.body;

  if (!name || !email || !phone || !department) {
    throw new ApiError(
      400,
      "Name, email, phone and department are required"
    );
  }

  const result = await registerUser(name, email, phone, department);

  return res
    .status(201)
    .json(new ApiResponse(201, result || {}, result?.message || "OTP sent to your email"));
});

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await sendOTPService(email);

  return res
    .status(200)
    .json(new ApiResponse(200, result || {}, result?.message || "OTP sent to your email"));
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
