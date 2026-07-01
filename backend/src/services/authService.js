import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";
import { isCollegeEmail, getCollegeFromEmail } from "../utils/emailValidator.js";
import authMemoryStore from "./authMemoryStore.js";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isProduction = process.env.NODE_ENV === "production";

// Configure nodemailer transporter
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const readMemoryUser = (email) => authMemoryStore.users.get(normalizeEmail(email));

const writeMemoryUser = (user) => {
  authMemoryStore.users.set(normalizeEmail(user.email), user);
  return user;
};

const readMemoryOtp = (email) => authMemoryStore.otps.get(normalizeEmail(email));

const writeMemoryOtp = (email, otpRecord) => {
  authMemoryStore.otps.set(normalizeEmail(email), otpRecord);
  return otpRecord;
};

const clearMemoryOtp = (email) => {
  authMemoryStore.otps.delete(normalizeEmail(email));
};

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
  const normalizedEmail = normalizeEmail(email);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new ApiError(
      500,
      "Email service is not configured. Set EMAIL_USER and EMAIL_PASS in backend env.",
      "EMAIL_CONFIG_MISSING"
    );
  }

  let existingOTP;

  if (!isDatabaseReady()) {
    existingOTP = readMemoryOtp(normalizedEmail);
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
  } else {
    existingOTP = await OTP.findOne({ email: normalizedEmail });
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
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP with bcrypt
  const hashedOTP = await bcrypt.hash(otp, 10);

  // Save to OTP model
  if (isDatabaseReady()) {
    await OTP.createOTP(normalizedEmail, hashedOTP);
  } else {
    writeMemoryOtp(normalizedEmail, {
      email: normalizedEmail,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date(),
    });
  }

  // Send via nodemailer
  try {
    await mailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject,
      html: `
        <h2>Welcome to CampusBazar!</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 5px; font-family: monospace;">${otp}</h1>
        <p>This OTP will expire in 2 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
      `,
    });
  } catch (error) {
    console.error("OTP email send failed:", error?.message || error);

    if (!isProduction) {
      console.warn(`DEV OTP FALLBACK for ${normalizedEmail}: ${otp}`);
      return {
        message: "Email delivery failed; using development OTP fallback.",
        devOtp: otp,
      };
    }

    throw new ApiError(500, "Failed to send OTP email", "EMAIL_SEND_ERROR");
  }

  return { message: "OTP sent to your college email" };
};

// Register new user and send OTP for verification
const registerUser = async (name, email, phone, department) => {
  const normalizedEmail = normalizeEmail(email);

  // Validate college email
  if (!isCollegeEmail(normalizedEmail)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  const existingUser = isDatabaseReady() ? await User.findOne({ email: normalizedEmail }) : null;
  if (existingUser) {
    throw new ApiError(400, "Account already exists, please login");
  }

  if (!isDatabaseReady()) {
    const memoryUser = readMemoryUser(normalizedEmail);
    if (memoryUser) {
      throw new ApiError(400, "Account already exists, please login");
    }
  }

  const userData = {
    name,
    email: normalizedEmail,
    phone,
    department,
    college: getCollegeFromEmail(normalizedEmail),
    role: "user",
    isVerified: false,
  };

  if (isDatabaseReady()) {
    await User.create(userData);
  } else {
    writeMemoryUser({
      ...userData,
      _id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      refreshToken: null,
      profilePic: undefined,
    });
  }

  return createAndSendOTP(normalizedEmail, "CampusBazar - Verify your registration OTP");
};

// Send OTP for login
const sendOTP = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  // Validate college email
  if (!isCollegeEmail(normalizedEmail)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  if (isDatabaseReady()) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ApiError(400, "No account found, please register first");
    }

    return createAndSendOTP(normalizedEmail, "CampusBazar - Your login OTP");
  }

  const memoryUser = readMemoryUser(normalizedEmail);
  if (!memoryUser) {
    writeMemoryUser({
      _id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '',
      department: '',
      college: getCollegeFromEmail(normalizedEmail),
      role: 'user',
      isVerified: false,
      refreshToken: null,
      profilePic: undefined,
    });
  }

  return createAndSendOTP(normalizedEmail, "CampusBazar - Your login OTP");
};

// Verify OTP and authenticate user
const verifyOTP = async (email, otp) => {
  const normalizedEmail = normalizeEmail(email);

  // Validate college email
  if (!isCollegeEmail(normalizedEmail)) {
    throw new ApiError(
      400,
      "Only registered college emails are allowed",
      "INVALID_EMAIL_DOMAIN"
    );
  }

  // Find OTP record
  const otpRecord = isDatabaseReady() ? await OTP.findOne({ email: normalizedEmail }) : readMemoryOtp(normalizedEmail);
  if (!otpRecord) {
    throw new ApiError(400, "OTP not found or expired");
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiresAt) {
    if (isDatabaseReady()) {
      await OTP.deleteOne({ email: normalizedEmail });
    } else {
      clearMemoryOtp(normalizedEmail);
    }
    throw new ApiError(400, "OTP has expired");
  }

  // Compare plain OTP against hashed
  const isOTPValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isOTPValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = isDatabaseReady() ? await User.findOne({ email: normalizedEmail }) : readMemoryUser(normalizedEmail);
  if (!user) {
    throw new ApiError(400, "No account found, please register first");
  }

  user.isVerified = true;

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  if (isDatabaseReady()) {
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    await OTP.deleteOne({ email: normalizedEmail });
  } else {
    user.refreshToken = refreshToken;
    writeMemoryUser(user);
    clearMemoryOtp(normalizedEmail);
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
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
  if (isDatabaseReady()) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return;
  }

  for (const [email, user] of authMemoryStore.users.entries()) {
    if (user._id === userId) {
      authMemoryStore.users.set(email, { ...user, refreshToken: null });
      break;
    }
  }
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

  if (isDatabaseReady()) {
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
  }

  const memoryUser = [...authMemoryStore.users.values()].find((item) => String(item._id) === String(decoded._id));
  if (!memoryUser || memoryUser.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = jwt.sign(
    {
      _id: memoryUser._id,
      college: memoryUser.college,
      role: memoryUser.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return { accessToken };
};

const getProfileById = async (userId) => {
  if (!isDatabaseReady()) {
    const memoryUser = [...authMemoryStore.users.values()].find((item) => item._id === userId);
    if (!memoryUser) {
      throw new ApiError(404, "User not found");
    }

    return {
      _id: memoryUser._id,
      name: memoryUser.name,
      email: memoryUser.email,
      phone: memoryUser.phone,
      department: memoryUser.department,
      college: memoryUser.college,
      profilePic: memoryUser.profilePic,
      role: memoryUser.role,
      isVerified: memoryUser.isVerified,
      joinedAt: memoryUser.createdAt,
      updatedAt: memoryUser.updatedAt,
    };
  }

  const user = await User.findById(userId).select(
    "_id name email phone department college profilePic role isVerified createdAt updatedAt"
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