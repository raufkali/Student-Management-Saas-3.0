const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("../utils/helpers");
const {
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} = require("../config/env");

// Ensure upload directories exist
const uploadDirs = ["photos", "documents", "temp"];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(UPLOAD_PATH, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = UPLOAD_PATH;

    // Determine subdirectory based on file type
    if (file.fieldname === "photo" || file.fieldname === "profileImage") {
      uploadDir = path.join(UPLOAD_PATH, "photos");
    } else if (file.fieldname === "document" || file.fieldname === "file") {
      uploadDir = path.join(UPLOAD_PATH, "documents");
    } else {
      uploadDir = path.join(UPLOAD_PATH, "temp");
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${extension}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        400,
      ),
      false,
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Upload fields middleware
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Error handling middleware for upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: `Unexpected field: ${err.field}`,
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// Delete uploaded file
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
  return false;
};

// Delete multiple files
const deleteFiles = (filePaths) => {
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }

  return filePaths.map((filePath) => deleteFile(filePath));
};

// Get file info
const getFileInfo = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  return {
    name: path.basename(filePath),
    size: stats.size,
    extension: path.extname(filePath),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
};

// Generate public URL for file
const getFileUrl = (filePath, baseUrl = "/uploads") => {
  if (!filePath) return null;

  // Get relative path from upload directory
  const relativePath = path.relative(UPLOAD_PATH, filePath);
  return `${baseUrl}/${relativePath.replace(/\\/g, "/")}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  deleteFile,
  deleteFiles,
  getFileInfo,
  getFileUrl,
};
