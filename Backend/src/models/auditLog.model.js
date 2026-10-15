
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    entityType: {
      type: String,
      required: true,
      enum: [
        "User",
        "Employee",
        "Department",
        "LeaveType",
        "LeaveBalance",
        "LeaveRequest",
        "Attendance",
        "Notification",
        "Asset",
        "AssetAssignment",
        "EmployeeDocument",
        "System",
      ],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
      maxlength: 45,
    },

    userAgent: {
      type: String,
      default: null,
      maxlength: 1000,
    },

    requestId: {
      type: String,
      default: null,
      maxlength: 150,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
