const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validator");
const { body } = require("express-validator");

// Validation rules - Make them less strict for testing
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("role")
    .optional()
    .isIn(["admin", "staff", "teacher", "viewer"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", validate(registerValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.use(authMiddleware);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.put("/profile", authController.updateProfile);
router.post("/change-password", authController.changePassword);

// Admin routes
router.use(adminMiddleware);
router.get("/users", authController.getAllUsers);
router.put("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);

module.exports = router;
