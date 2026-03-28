require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const analyzeRouter = require("./routes/analyze");
const recipesRouter = require("./routes/recipes");
const tipsRouter = require("./routes/tips");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many analyze requests, please wait a moment." },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/analyze", analyzeLimiter, analyzeRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/tips", tipsRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🥦 LeftoverLens API running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Anthropic AI: ${process.env.ANTHROPIC_API_KEY ? "✓ configured" : "✗ missing key"}`);
});

module.exports = app;
