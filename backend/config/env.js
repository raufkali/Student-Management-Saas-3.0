require("dotenv").config();

const env = {
  // Server configuration
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database configuration
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/student_management",
  DB_NAME: process.env.DB_NAME || "student_management",

  // JWT configuration
  JWT_SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    "your-refresh-secret-key-change-in-production",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  // File upload configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
  ALLOWED_FILE_TYPES: (
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/png,image/jpg,application/pdf"
  ).split(","),
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./backend/uploads",

  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@student-management.com",

  // Backup configuration
  BACKUP_PATH: process.env.BACKUP_PATH || "./backups",
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,

  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_PATH: process.env.LOG_PATH || "./logs",

  // Security configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  RATE_LIMIT_WINDOW:
    parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Application configuration
  APP_NAME: process.env.APP_NAME || "Student Management System",
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
};

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0 && env.NODE_ENV === "production") {
  console.warn(
    "⚠️  Missing required environment variables:",
    missingEnvVars.join(", "),
  );
  console.warn("Please set these variables in your .env file");
}

// Log configuration in development
if (env.NODE_ENV === "development") {
  console.log("📋 Environment Configuration:");
  console.log(`  Port: ${env.PORT}`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Database: ${env.DB_NAME}`);
  console.log(`  Upload Path: ${env.UPLOAD_PATH}`);
  console.log(`  Max File Size: ${env.MAX_FILE_SIZE / 1024 / 1024}MB`);
}

module.exports = env;
