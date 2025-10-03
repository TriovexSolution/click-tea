// middleware/rateLimiters.js
const rateLimit = require("express-rate-limit");

// Protect OTP send: e.g. max 5 requests per 1 hour per IP
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many OTP requests from this IP, please try later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Protect OTP verify: e.g. max 10 attempts per 15 minutes per IP (and combine with account lockout)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many verification attempts, please try later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };
