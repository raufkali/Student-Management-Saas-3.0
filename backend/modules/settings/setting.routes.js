const express = require("express");
const router = express.Router();
const settingController = require("./setting.controller");
const { authMiddleware, adminMiddleware } = require("../../middlewares/auth");

// Public routes (no auth required)
router.get("/public", settingController.getPublicSettings);

// Protected routes (auth required)
router.use(authMiddleware);

// Get all settings
router.get("/", settingController.getAllSettings);

// Get settings by category
router.get("/category/:category", settingController.getSettingsByCategory);

// Get single setting
router.get("/:key", settingController.getSetting);

// Admin only routes
router.use(adminMiddleware);

// Create/update setting
router.post("/", settingController.setSetting);

// Initialize default settings
router.post("/initialize", settingController.initializeSettings);

// Delete setting
router.delete("/:key", settingController.deleteSetting);

module.exports = router;
