import { rateLimit } from "express-rate-limit";

// For all API routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message,
      success: false,
    });
  },
  message: "Too many requests. Try again later.",
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// For user login
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message,
      success: false,
    });
  },
  message: "Too many requests. Try again in 15 minutes.",
  skipSuccessfulRequests: true,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// For user registration
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message,
      success: false,
    });
  },
  message: "Too many requests. Try again later.",
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});
