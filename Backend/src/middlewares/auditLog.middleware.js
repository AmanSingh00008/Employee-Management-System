import { AuditLog } from "../models/auditLog.model.js";

export const writeAuditLog = async ({
  req,
  action,
  entityType,
  entityId,
  changes,
  metadata,
}) => {
  try {
    await AuditLog.create({
      actorId: req.user?._id,
      action,
      entityType,
      entityId,
      changes,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.requestId,
      metadata,
    });
  } catch (error) {
    // Do not silently ignore this in production.
    // Send the failure to your structured logger/monitoring system.
    console.error("Failed to write audit log:", error.message);
  }
};