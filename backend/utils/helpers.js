const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE,
} = require("../config/env");

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

// Hash token (for password reset)
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Format date
const formatDate = (date, format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

// Get date range
const getDateRange = (range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate, endDate;

  switch (range) {
    case "today":
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      break;
    case "week":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Pick properties from object
const pick = (obj, keys) => {
  const result = {};
  keys.forEach((key) => {
    if (obj && obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Omit properties from object
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

// Check if value is empty
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

// Slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

// Truncate string
const truncate = (text, length = 100, suffix = "...") => {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

// Capitalize first letter
const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Convert to title case
const toTitleCase = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

// Generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Parse JSON safely
const safeJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
};

// Retry operation
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

// Measure execution time
const measureTime = async (fn) => {
  const start = process.hrtime();
  const result = await fn();
  const [seconds, nanoseconds] = process.hrtime(start);
  const duration = seconds * 1000 + nanoseconds / 1000000;
  return { result, duration };
};

module.exports = {
  AppError,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomString,
  generateOTP,
  formatDate,
  getDateRange,
  deepClone,
  pick,
  omit,
  isEmpty,
  slugify,
  truncate,
  capitalize,
  toTitleCase,
  generateUniqueId,
  safeJSONParse,
  retry,
  measureTime,
};
