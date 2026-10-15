
import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    tokenHash: {
      type: String,
      required: [true, "Refresh token hash is required"],
      unique: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    replacedByTokenHash: {
      type: String,
      default: null,
      select: false,
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

    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired sessions.
// TTL deletion is asynchronous, so authentication must still
// check expiresAt explicitly.
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

refreshSessionSchema.index({ userId: 1, revokedAt: 1 });

export const RefreshSession = mongoose.model(
  "RefreshSession",
  refreshSessionSchema
);
