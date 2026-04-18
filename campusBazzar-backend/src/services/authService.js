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

const createAndSendOTP = async (email, subject = "CampusBazar - Your OTP") => {
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
      subject,
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

  return { message: "OTP sent to your college email" };
};

// Register new user and send OTP for verification
const registerUser = async (name, email, phone, department, branch) => {
  // Validate college email
  if (!isCollegeEmail(email)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Account already exists, please login");
  }

  await User.create({
    name,
    email,
    phone,
    department,
    branch,
    college: getCollegeFromEmail(email),
    role: "user",
    isVerified: false,
  });

  return createAndSendOTP(email, "CampusBazar - Verify your registration OTP");
};

// Send OTP for login
const sendOTP = async (email) => {
  // Validate college email
  if (!isCollegeEmail(email)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "No account found, please register first");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please complete registration by verifying your OTP");
  }

  return createAndSendOTP(email, "CampusBazar - Your login OTP");
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
    throw new ApiError(400, "OTP not found or expired");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiresAt) {
    await OTP.deleteOne({ email });
    throw new ApiError(400, "OTP has expired");
  }

  // Compare plain OTP against hashed
  const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOTPValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "No account found, please register first");
  }

  user.isVerified = true;

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
      phone: user.phone,
      department: user.department,
      branch: user.branch,
      college: user.college,
      profilePic: user.profilePic,
      role: user.role,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const refreshUserAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = jwt.sign(
    {
      _id: user._id,
      college: user.college,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken };
};

const getProfileById = async (userId) => {
  const user = await User.findById(userId).select(
    "_id name email phone department branch college profilePic role isVerified createdAt updatedAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    branch: user.branch,
    college: user.college,
    profilePic: user.profilePic,
    role: user.role,
    isVerified: user.isVerified,
    joinedAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export {
  registerUser,
  sendOTP,
  verifyOTP,
  logoutUser,
  refreshUserAccessToken,
  getProfileById,
};