const authService = require("./auth.service");
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendUnauthorized,
} = require("../../utils/response");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/helpers");
const { JWT_EXPIRE, JWT_REFRESH_EXPIRE } = require("../../config/env");

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const userData = req.body;
      console.log("Registration attempt:", {
        email: userData.email,
        username: userData.username,
      });

      const user = await authService.registerUser(userData);
      console.log("User registered successfully:", user.email);

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to user
      await authService.addRefreshToken(user._id, refreshToken);

      return sendCreated(res, {
        message: "User registered successfully",
        user,
        token,
        refreshToken,
        expiresIn: JWT_EXPIRE,
        refreshExpiresIn: JWT_REFRESH_EXPIRE,
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, "Email and password are required", 400);
      }

      const user = await authService.loginUser(email, password);

      // Check if account is locked
      if (user.isAccountLocked()) {
        return sendError(
          res,
          "Account is locked due to multiple failed attempts. Please try again later.",
          403,
        );
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      await authService.updateLastLogin(user._id);

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token
      await authService.addRefreshToken(user._id, refreshToken);

      return sendSuccess(res, {
        message: "Login successful",
        user,
        token,
        refreshToken,
        expiresIn: JWT_EXPIRE,
        refreshExpiresIn: JWT_REFRESH_EXPIRE,
      });
    } catch (error) {
      // Increment login attempts on failed login
      if (error.message === "Invalid login credentials") {
        try {
          const user = await authService.findUserByEmail(req.body.email);
          if (user) {
            await user.incrementLoginAttempts();
          }
        } catch (err) {
          // Silent fail
        }
      }
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendError(res, "Refresh token is required", 400);
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Get user and check if refresh token exists
      const user = await authService.findUserById(decoded.id);
      if (!user) {
        return sendUnauthorized(res, "Invalid refresh token");
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = user.refreshTokens.some(
        (t) => t.token === refreshToken,
      );
      if (!tokenExists) {
        return sendUnauthorized(res, "Invalid refresh token");
      }

      // Remove old refresh token
      await authService.removeRefreshToken(user._id, refreshToken);

      // Generate new tokens
      const newToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      // Save new refresh token
      await authService.addRefreshToken(user._id, newRefreshToken);

      return sendSuccess(res, {
        message: "Token refreshed successfully",
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRE,
        refreshExpiresIn: JWT_REFRESH_EXPIRE,
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return sendUnauthorized(res, "Invalid refresh token");
      }
      if (error.name === "TokenExpiredError") {
        return sendUnauthorized(res, "Refresh token expired");
      }
      next(error);
    }
  }

  // Logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.removeRefreshToken(req.user._id, refreshToken);
      }

      return sendSuccess(res, {
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await authService.findUserById(req.user._id);
      if (!user) {
        return sendError(res, "User not found", 404);
      }

      return sendSuccess(res, {
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      const userId = req.user._id;

      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.email;
      delete updates.role;
      delete updates.isActive;

      const user = await authService.updateUser(userId, updates);

      return sendSuccess(res, {
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(
          res,
          "Current password and new password are required",
          400,
        );
      }

      await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword,
      );

      return sendSuccess(res, {
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendError(res, "Email is required", 400);
      }

      const resetToken = await authService.createPasswordResetToken(email);

      // In production, send email with reset token
      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      return sendSuccess(res, {
        message: "Password reset token generated successfully",
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
        resetURL: process.env.NODE_ENV === "development" ? resetURL : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return sendError(res, "Token and new password are required", 400);
      }

      await authService.resetPassword(token, newPassword);

      return sendSuccess(res, {
        message: "Password reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role, isActive } = req.query;

      const result = await authService.getAllUsers({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        role,
        isActive,
      });

      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Update user (admin only)
  async updateUser(req, res, next) {
    try {
      const userId = req.params.id;
      const updates = req.body;

      // Prevent updating certain fields
      delete updates.password;
      delete updates._id;
      delete updates.createdAt;
      delete updates.updatedAt;

      const user = await authService.updateUser(userId, updates);

      return sendSuccess(res, {
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;

      // Prevent self-deletion
      if (userId === req.user._id.toString()) {
        return sendError(res, "Cannot delete your own account", 400);
      }

      await authService.deleteUser(userId);

      return sendSuccess(res, {
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
