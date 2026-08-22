const { AppError } = require("../utils/helpers");
const { NODE_ENV } = require("../config/env");
const fs = require("fs");
const path = require("path");

// Handle 404 errors for API routes
const notFoundHandler = (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    const error = new AppError(`API Route ${req.originalUrl} not found`, 404);
    return next(error);
  }
  next();
};

// Main error handler
const errorHandler = (err, req, res, next) => {
  // Log error
  logError(err, req);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    // Mongoose cast error (invalid ID)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please login again.";
  } else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field";
  }

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Prepare response
  const response = {
    success: false,
    message: message,
  };

  // Add errors if present
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development
  if (NODE_ENV === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  // Send response
  res.status(statusCode).json(response);
};

// Log error to file
const logError = (err, req) => {
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(
      logDir,
      `error-${new Date().toISOString().split("T")[0]}.log`,
    );
    const logEntry = {
      timestamp: new Date().toISOString(),
      statusCode: err.statusCode || 500,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?._id || null,
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
  } catch (error) {
    console.error("Error logging error:", error);
  }
};

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  notFoundHandler,
  errorHandler,
  APIError,
  logError,
};
