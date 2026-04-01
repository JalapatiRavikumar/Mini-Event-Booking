const express = require("express");
const cors = require("cors");
const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const HttpError = require("./utils/httpError");

const app = express();
const swaggerPath = path.join(__dirname, "..", "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: false,
  origin(origin, callback) {
    // Allow non-browser clients (curl, server-to-server).
    if (!origin) {
      callback(null, true);
      return;
    }

    // Backward-compatible local behavior when not explicitly configured.
    if (allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new HttpError(403, "CORS origin not allowed"));
  }
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy"
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

app.use((req, res, next) => {
  next(new HttpError(404, "Route not found"));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  if (statusCode >= 500) {
    // Keep server-side details in logs only.
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message
    }
  });
});

module.exports = app;
