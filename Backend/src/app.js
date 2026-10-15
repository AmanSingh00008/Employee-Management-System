
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import { ApiError } from "./utils/ApiError.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security-related HTTP headers.
app.use(helmet());

// Allow only configured frontend origins.
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as
      // many server-to-server and command-line requests.
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new ApiError(403, "Origin not allowed by CORS")
      );
    },
    credentials: true,
  })
);

// Parse JSON request bodies with a size limit.
app.use(express.json({ limit: "1mb" }));

// Parse URL-encoded form bodies.
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// Basic health endpoint.
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkforceHub API is running",
    environment: env.NODE_ENV,
  });
});

// Register feature routes here as the project grows.
// Example: app.use("/api/v1/auth", authRoutes);

// Handle unknown routes and errors LAST.
app.use(notFound);
app.use(errorHandler);

export default app;
