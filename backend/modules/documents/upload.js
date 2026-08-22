const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} = require("../../config/env");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(UPLOAD_PATH, "documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${extension}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
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

module.exports = {
  upload,
};
