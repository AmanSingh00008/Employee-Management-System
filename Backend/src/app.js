import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { ApiError } from "./utils/ApiError.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestId } from "./middlewares/requestId.middleware.js";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middlewares/rateLimit.middleware.js";

import authRouter from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import userRoutes from "./routes/user.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveBalanceRoutes from "./routes/leaveBalance.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import assetRoutes from "./routes/asset.routes.js";
import assetAssignmentRoutes from "./routes/assetAssignment.routes.js";
import employeeDocumentRoutes from "./routes/employeeDocument.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import refreshSessionRoutes from "./routes/refreshSession.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";

// ─── App ────────────────────────────────────────────────────────────────────
const app = express();

// ─── Security Headers ───────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g., server-to-server, curl)
      if (!origin) return callback(null, true);

      // Allow explicit origins from env
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);

      // Allow any localhost / 127.0.0.1 with any port for local development
      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        if (isLocalhost) return callback(null, true);
      } catch (e) {
        // If origin is not a valid URL, fallthrough to reject
      }

      return callback(new ApiError(403, "Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// ─── Body & Cookie Parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ─── Request ID ─────────────────────────────────────────────────────────────
app.use(requestId);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use("/api/", generalRateLimiter);
app.use("/api/auth/login", authRateLimiter);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WorkforceHub API is running",
    environment: env.NODE_ENV,
  });
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ─── Feature Routes ──────────────────────────────────────────────────────────
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leave-types", leaveTypeRoutes);
app.use("/api/v1/leave-balances", leaveBalanceRoutes);
app.use("/api/v1/leave-requests", leaveRequestRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/asset-assignments", assetAssignmentRoutes);
app.use("/api/v1/employee-documents", employeeDocumentRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/sessions", refreshSessionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);

// ─── Error Handling (must be last) ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
