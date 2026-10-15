
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // Handle invalid MongoDB document IDs.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
    details = null;
  }

  // Handle duplicate MongoDB unique-index values.
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
    details = null;
  }

  // Avoid exposing internal server errors.
  if (statusCode >= 500) {
    message = "Internal server error";
    details = null;
  }

  // Only expose details from explicitly created API errors.
  if (!(err instanceof ApiError)) {
    details = null;
  }

  console.error({
    message: err.message,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    stack: env.NODE_ENV === "development"
      ? err.stack
      : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    code: statusCode >= 500
      ? "INTERNAL_SERVER_ERROR"
      : err.code === 11000
        ? "DUPLICATE_RESOURCE"
        : statusCode === 404
          ? "NOT_FOUND"
          : statusCode === 403
            ? "FORBIDDEN"
            : statusCode === 401
              ? "UNAUTHORIZED"
              : statusCode === 400
                ? "BAD_REQUEST"
                : "REQUEST_ERROR",
    details,
  });
};
