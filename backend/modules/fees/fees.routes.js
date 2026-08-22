// backend/modules/fees/fees.routes.js

const express = require("express");
const router = express.Router();
const feeController = require("./fees.controllers");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validator");
const { body, param, query } = require("express-validator");

// Validation rules
const createFeeValidation = [
  body("studentId").isMongoId().withMessage("Invalid student ID"),
  body("feeItems").isArray().withMessage("Fee items must be an array"),
  body("totalFee").isNumeric().withMessage("Total fee is required"),
  body("academicYear").notEmpty().withMessage("Academic year is required"),
];

const recordPaymentValidation = [
  body("amount").isNumeric().withMessage("Amount is required"),
  body("paymentMethod")
    .isIn(["cash", "bank_transfer", "cheque", "online", "other"])
    .withMessage("Invalid payment method"),
  body("paymentType")
    .isIn([
      "tuition",
      "admission",
      "exam",
      "library",
      "lab",
      "sports",
      "transport",
      "late_fee",
      "fine",
      "other",
    ])
    .withMessage("Invalid payment type"),
];

const idValidation = [param("id").isMongoId().withMessage("Invalid ID")];

// All routes require authentication
router.use(authMiddleware);

// Fee Structure Routes (Admin only)
router.post(
  "/structures",
  adminMiddleware,
  validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("grade").notEmpty().withMessage("Grade is required"),
    body("academicYear").notEmpty().withMessage("Academic year is required"),
    body("totalAmount").isNumeric().withMessage("Total amount is required"),
  ]),
  feeController.createFeeStructure,
);

router.get("/structures", feeController.getAllFeeStructures);
router.get("/structures/grade/:grade", feeController.getFeeStructuresByGrade);
router.get("/structures/:id", feeController.getFeeStructureById);

router.put(
  "/structures/:id",
  adminMiddleware,
  validate(idValidation),
  feeController.updateFeeStructure,
);

router.delete(
  "/structures/:id",
  adminMiddleware,
  validate(idValidation),
  feeController.deleteFeeStructure,
);

// Fee Record Routes
router.post(
  "/records",
  validate(createFeeValidation),
  feeController.createFeeRecord,
);

router.post(
  "/records/:id/payment",
  validate([...idValidation, ...recordPaymentValidation]),
  feeController.recordPayment,
);

router.get("/records", feeController.getAllFeeRecords);
router.get("/records/student/:studentId", feeController.getStudentFeeRecords);
router.get(
  "/records/student/:studentId/balance",
  feeController.getStudentBalance,
);
router.get("/records/outstanding", feeController.getOutstandingFees);
router.get("/records/collection-report", feeController.getCollectionReport);

// NEW: Download receipt as PDF
router.get(
  "/records/:id/receipt",
  validate(idValidation),
  feeController.generateReceipt,
);

router.get(
  "/records/:id",
  validate(idValidation),
  feeController.getFeeRecordById,
);

router.put(
  "/records/:id",
  validate(idValidation),
  feeController.updateFeeRecord,
);

router.delete(
  "/records/:id",
  adminMiddleware,
  validate(idValidation),
  feeController.deleteFeeRecord,
);

// Dashboard statistics
router.get("/statistics", feeController.getFeeStatistics);

module.exports = router;
