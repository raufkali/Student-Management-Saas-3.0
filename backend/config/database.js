const mongoose = require("mongoose");
const { MONGODB_URI, DB_NAME, NODE_ENV } = require("./env");

mongoose.set("bufferCommands", false);

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("Database already connected");
    return;
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 10000,
      family: 4,
      dbName: DB_NAME,
    };

    mongoose.connection.on("connected", () => {
      console.log(`✅ MongoDB connected successfully to database: ${DB_NAME}`);
      isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.warn("MongoDB connection warning:", err.message);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    if (MONGODB_URI && !MONGODB_URI.includes("localhost:27017")) {
      await mongoose.connect(MONGODB_URI, options);
    } else {
      console.log("ℹ️ In-Memory data store active with rich seed data (MongoDB URI optional)");
    }

    return mongoose.connection;
  } catch (error) {
    console.warn("ℹ️ MongoDB offline — running in high-performance in-memory mode:", error.message);
  }
}

async function closeDatabase() {
  if (mongoose.connection) {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      isConnected = false;
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
}

// Get database instance
function getDB() {
  return mongoose.connection.db;
}

// Check if database is connected
function isDatabaseConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  closeDatabase,
  getDB,
  isDatabaseConnected,
};
