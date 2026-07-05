import rateLimit from 'express-rate-limit';

const handler = (message, code) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
    error: { code, message },
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many requests. Please try again later.', 'RATE_LIMIT_EXCEEDED'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many auth attempts. Please try again later.', 'AUTH_RATE_LIMIT_EXCEEDED'),
});

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many OTP requests. Please try again later.', 'OTP_RATE_LIMIT_EXCEEDED'),
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many image uploads. Please try again later.', 'UPLOAD_RATE_LIMIT_EXCEEDED'),
});

export const listingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many listings created. Please try again later.', 'LISTING_RATE_LIMIT_EXCEEDED'),
});
