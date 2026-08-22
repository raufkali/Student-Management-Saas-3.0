const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./modules/auth/auth.routes");
const studentRoutes = require("./modules/students/student.routes");
const documentRoutes = require("./modules/documents/document.routes");
const settingRoutes = require("./modules/settings/setting.routes");
const feeRoutes = require("./modules/fees/fees.routes");

// Import middleware
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const { authMiddleware } = require("./middlewares/auth");

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Create a write stream (in append mode)
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"),
    { flags: "a" },
  );
  app.use(morgan("combined", { stream: accessLogStream }));
}

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/temp", express.static(path.join(__dirname, "uploads/temp")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", authMiddleware, studentRoutes);
app.use("/api/documents", authMiddleware, documentRoutes);
app.use("/api/settings", authMiddleware, settingRoutes);
app.use("/api/fees", authMiddleware, feeRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Info route
app.get("/api", (req, res) => {
  res.json({
    message: "Student Management System API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students",
      documents: "/api/documents",
      settings: "/api/settings",
      fees: "/api/fees",
      health: "/api/health",
    },
  });
});

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
