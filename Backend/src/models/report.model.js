
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reportType: {
      type: String,
      enum: [
        "employees",
        "attendance",
        "leave_requests",
        "departments",
      ],
      required: true,
    },

    format: {
      type: String,
      enum: ["csv", "xlsx", "pdf"],
      default: "csv",
    },

    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    recordCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "completed",
    },

    fileName: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    errorMessage: {
      type: String,
      maxlength: 1000,
      select: false,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, createdAt: -1 });

export const Report = mongoose.model("Report", reportSchema);
