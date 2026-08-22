const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validator");
const { uploadSingle, handleUploadError } = require("../../middlewares/upload");
const { body, param, query } = require("express-validator");

// Validation rules
const createStudentValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("dateOfBirth")
    .isISO8601()
    .withMessage("Valid date of birth is required"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("nationality").notEmpty().withMessage("Nationality is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("address.city").notEmpty().withMessage("City is required"),
  body("address.state").notEmpty().withMessage("State is required"),
  body("address.country").notEmpty().withMessage("Country is required"),
  body("grade").notEmpty().withMessage("Grade is required"),
  body("academicYear").notEmpty().withMessage("Academic year is required"),
  body("fatherName").notEmpty().withMessage("Father's name is required"),
  body("fatherPhone").notEmpty().withMessage("Father's phone is required"),
  body("motherName").notEmpty().withMessage("Mother's name is required"),
];

const updateStudentValidation = [
  param("id").isMongoId().withMessage("Invalid student ID"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
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
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid student ID"),
];

// Protected routes
router.use(authMiddleware);

// CRUD operations
router.post(
  "/",
  validate(createStudentValidation),
  studentController.createStudent,
);

router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  studentController.getAllStudents,
);

router.get("/statistics", studentController.getStatistics);

router.get(
  "/search",
  [query("q").notEmpty().withMessage("Search term is required")],
  studentController.searchStudents,
);

router.get(
  "/grade/:grade",
  [param("grade").notEmpty().withMessage("Grade is required")],
  studentController.getStudentsByGrade,
);

router.get("/export", studentController.exportStudents);

router.post(
  "/import",
  uploadSingle("file"),
  handleUploadError,
  studentController.importStudents,
);

router.get("/:id", validate(idValidation), studentController.getStudentById);

router.put(
  "/:id",
  validate(updateStudentValidation),
  studentController.updateStudent,
);

router.delete("/:id", validate(idValidation), studentController.deleteStudent);

// Admin only routes
router.use(adminMiddleware);

router.delete(
  "/:id/permanent",
  validate(idValidation),
  studentController.permanentlyDeleteStudent,
);

router.post(
  "/:id/restore",
  validate(idValidation),
  studentController.restoreStudent,
);

router.post(
  "/:id/photo",
  uploadSingle("photo"),
  handleUploadError,
  studentController.uploadPhoto,
);

// NEW: Bulk actions
router.post("/promote", studentController.promoteStudents);
router.post("/fail", studentController.failStudents);

module.exports = router;
