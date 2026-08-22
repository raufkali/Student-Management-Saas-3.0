import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = require("./backend/app");
const { connectDB } = require("./backend/config/database");

const PORT = 3000;

async function startServer() {
  // Attempt DB Connection asynchronously (won't block UI start)
  connectDB().catch((err: any) => {
    console.warn("MongoDB connection notice:", err?.message || err);
  });

  // Serve uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "backend/uploads")));
  app.use("/temp", express.static(path.join(process.cwd(), "backend/uploads/temp")));

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Student Management System SaaS running on http://localhost:${PORT}`);
  });
}

startServer();
