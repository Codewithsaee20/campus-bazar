// src/models/otp.model.js

import mongoose from 'mongoose';
import { isCollegeEmail } from '../utils/emailValidator.js';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: isCollegeEmail,
        message: 'Only approved email domains are allowed',
      },
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB auto-deletes document when expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Also index email for fast lookup during verify
otpSchema.index({ email: 1 });

// Static method — deletes any old OTP for this email, then creates fresh one
otpSchema.statics.createOTP = async function (email, hashedOtp) {
  // Delete existing OTP for this email if any
  await this.deleteOne({ email });

  // Create and return new OTP document
  const otpDoc = await this.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
  });

  return otpDoc;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;