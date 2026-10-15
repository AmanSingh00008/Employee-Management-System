
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: [
        "leave",
        "attendance",
        "employee",
        "asset",
        "system",
      ],
      default: "system",
    },

    link: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
notificationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $type: "date" } },
  }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);
