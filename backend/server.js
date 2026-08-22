const app = require("./app");
const { connectDB, closeDatabase } = require("./config/database");
const { PORT, NODE_ENV } = require("./config/env");

let server = null;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📁 Environment: ${NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);

      if (NODE_ENV === "development") {
        console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      }
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please use a different port.`,
        );
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  console.log("🛑 Shutting down gracefully...");

  try {
    // Close the server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Close database connection
    await closeDatabase();

    console.log("✅ Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

// Export for Electron
module.exports = { startServer, gracefulShutdown };
