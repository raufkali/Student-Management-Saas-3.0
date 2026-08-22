const { body, param, query, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

// Validate student creation
const validateStudentCreate = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Valid date of birth is required")
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 5 || age > 25) {
        throw new Error("Student age must be between 5 and 25 years");
      }
      return true;
    }),

  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),

  body("nationality").trim().notEmpty().withMessage("Nationality is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),

  body("address.city").trim().notEmpty().withMessage("City is required"),
  body("address.state").trim().notEmpty().withMessage("State is required"),
  body("address.country").trim().notEmpty().withMessage("Country is required"),

  body("grade")
    .trim()
    .notEmpty()
    .withMessage("Grade is required")
    .isLength({ max: 10 })
    .withMessage("Grade cannot exceed 10 characters"),

  body("academicYear")
    .trim()
    .notEmpty()
    .withMessage("Academic year is required"),

  body("fatherName").trim().notEmpty().withMessage("Father's name is required"),
  body("fatherPhone")
    .trim()
    .notEmpty()
    .withMessage("Father's phone is required"),
  body("motherName").trim().notEmpty().withMessage("Mother's name is required"),

  body("status")
    .optional()
    .isIn([
      "active",
      "inactive",
      "graduated",
      "withdrawn",
      "suspended",
      "failed",
    ])
    .withMessage("Invalid status"),

  // ✅ SEND ALL ERRORS, NOT JUST THE FIRST ONE
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
    next();
  },
];

// Validate student update
const validateStudentUpdate = [
  param("id").isMongoId().withMessage("Invalid student ID"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),

  body("status")
    .optional()
    .isIn([
      "active",
      "inactive",
      "graduated",
      "withdrawn",
      "suspended",
      "failed",
    ])
    .withMessage("Invalid status"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Please provide a valid phone number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
    next();
  },
];

// Validate student ID param
const validateStudentId = [
  param("id").isMongoId().withMessage("Invalid student ID"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
    next();
  },
];

// Validate student query parameters
const validateStudentQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("grade")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Grade cannot exceed 10 characters"),

  query("section")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Section cannot exceed 10 characters"),

  query("status")
    .optional()
    .isIn([
      "active",
      "inactive",
      "graduated",
      "withdrawn",
      "suspended",
      "failed",
    ])
    .withMessage("Invalid status"),

  query("fromDate").optional().isISO8601().withMessage("Invalid date format"),
  query("toDate").optional().isISO8601().withMessage("Invalid date format"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
    }
    next();
  },
];

module.exports = {
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentId,
  validateStudentQuery,
};
