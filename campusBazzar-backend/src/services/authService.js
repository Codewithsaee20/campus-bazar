import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { isCollegeEmail, getCollegeFromEmail } from "../utils/emailValidator.js";

// Configure nodemailer transporter
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      college: user.college,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Send OTP to email
const sendOTP = async (email) => {
  // Validate college email
  if (!isCollegeEmail(email)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  // Check rate limit — no OTP request within 60 seconds
  const existingOTP = await OTP.findOne({ email });
  if (existingOTP) {
    const secondsElapsed = (Date.now() - existingOTP.createdAt) / 1000;
    if (secondsElapsed < 60) {
      throw new ApiError(
        429,
        `Please wait ${Math.ceil(60 - secondsElapsed)} seconds before requesting another OTP`,
        "RATE_LIMIT_EXCEEDED"
      );
    }
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP with bcrypt
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Save to OTP model
  await OTP.createOTP(email, hashedOTP);

  // Send via nodemailer
  try {
    await mailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "CampusBazar - Your OTP for Login",
      html: `
        <h2>Welcome to CampusBazar!</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 5px; font-family: monospace;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      `,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to send OTP email", "EMAIL_SEND_ERROR");
  }

  return { message: "OTP sent successfully to your email" };
};

// Verify OTP and authenticate user
const verifyOTP = async (email, otp) => {
  // Validate college email
  if (!isCollegeEmail(email)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  // Find OTP record
  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord) {
    throw new ApiError(404, "OTP not found or expired", "OTP_NOT_FOUND");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ email });
    throw new ApiError(401, "OTP has expired", "OTP_EXPIRED");
  }

  // Compare plain OTP against hashed
  const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOTPValid) {
    throw new ApiError(401, "Invalid OTP", "INVALID_OTP");
  }

  // Find or create user
  let user = await User.findOne({ email });
  const college = getCollegeFromEmail(email);

  if (!user) {
    // Create new user with extracted college name from email
    user = await User.create({
      name: email.split("@")[0], // Default name from email
      email,
      college,
      isVerified: true,
    });
  } else {
    // Update existing user
    user.isVerified = true;
    user.college = college;
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refreshToken to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Delete OTP record after successful verification
  await OTP.deleteOne({ email });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      profilePic: user.profilePic,
      role: user.role,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

// Get user by ID
const getUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
};

export { sendOTP, verifyOTP, getUser, generateTokens };