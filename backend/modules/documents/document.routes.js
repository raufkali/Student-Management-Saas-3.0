const express = require("express");
const router = express.Router();
const documentController = require("./document.controller");
const { authMiddleware } = require("../../middlewares/auth");
const { uploadSingle, handleUploadError } = require("../../middlewares/upload");
const { validate } = require("../../middlewares/validator");
const { body, param } = require("express-validator");

// Validation rules
const uploadValidation = [
  body("title").notEmpty().withMessage("Document title is required"),
  body("category")
    .optional()
    .isIn(["student", "academic", "administrative", "financial", "other"]),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid document ID"),
];

// Protected routes
router.use(authMiddleware);

// Upload document
router.post(
  "/upload",
  uploadSingle("document"),
  handleUploadError,
  validate(uploadValidation),
  documentController.uploadDocument,
);

// Get all documents
router.get("/", documentController.getAllDocuments);

// Get document statistics
router.get("/statistics", documentController.getStatistics);

// Get documents by student
router.get(
  "/student/:studentId",
  [param("studentId").isMongoId().withMessage("Invalid student ID")],
  documentController.getDocumentsByStudent,
);

// Download document
router.get(
  "/:id/download",
  validate(idValidation),
  documentController.downloadDocument,
);

// Get document by ID
router.get("/:id", validate(idValidation), documentController.getDocumentById);

// Update document
router.put("/:id", validate(idValidation), documentController.updateDocument);

// Delete document
router.delete(
  "/:id",
  validate(idValidation),
  documentController.deleteDocument,
);

module.exports = router;
