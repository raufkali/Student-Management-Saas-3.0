const jwt = require("jsonwebtoken");
const User = require("../modules/auth/auth.model");
const { sendUnauthorized, sendForbidden } = require("../utils/response");
const { JWT_SECRET } = require("../config/env");

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendUnauthorized(res, "No token provided");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    let user = null;
    try {
      user = await User.findById(decoded.id).select(
        "-password -refreshTokens -passwordResetToken -loginAttempts",
      );
    } catch (dbErr) {
      // MongoDB offline
    }

    if (!user) {
      const store = require("../config/inMemoryStore");
      const found = store.users.find((u) => u._id === decoded.id || u.email === decoded.email);
      if (found) {
        user = {
          ...found,
          _id: found._id,
          toObject: () => found,
        };
      }
    }

    if (!user) {
      return sendUnauthorized(res, "User not found");
    }

    // Check if user is active
    if (!user.isActive) {
      return sendForbidden(res, "Account is deactivated");
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10,
      );
      if (decoded.iat < changedTimestamp) {
        return sendUnauthorized(
          res,
          "Password has been changed. Please login again.",
        );
      }
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendUnauthorized(res, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return sendUnauthorized(res, "Token expired");
    }
    next(error);
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "User not authenticated");
  }

  if (req.user.role !== "admin") {
    return sendForbidden(res, "Admin access required");
  }

  next();
};

// Staff middleware
const staffMiddleware = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "User not authenticated");
  }

  if (!["admin", "staff"].includes(req.user.role)) {
    return sendForbidden(res, "Staff access required");
  }

  next();
};

// Teacher middleware
const teacherMiddleware = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "User not authenticated");
  }

  if (!["admin", "staff", "teacher"].includes(req.user.role)) {
    return sendForbidden(res, "Teacher access required");
  }

  next();
};

// Check if user owns the resource or is admin
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check if user is admin or owner
      if (
        req.user.role === "admin" ||
        resource.createdBy?.toString() === req.user._id.toString()
      ) {
        req.resource = resource;
        return next();
      }

      return sendForbidden(
        res,
        "You do not have permission to access this resource",
      );
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authMiddleware,
  authorize,
  adminMiddleware,
  staffMiddleware,
  teacherMiddleware,
  checkOwnership,
};
