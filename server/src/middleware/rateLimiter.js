const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, 'Too many requests from this IP, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  }
});

// Strict Rate Limiter for Auth / Login / Registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, 'Too many authentication attempts. Please try again after 15 minutes.', 429, 'AUTH_RATE_LIMIT');
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
