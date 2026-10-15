
import mongoose from "mongoose";

const employeeDocumentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      enum: [
        "identity",
        "education",
        "employment",
        "contract",
        "salary",
        "other",
      ],
      required: true,
    },

    storageKey: {
      type: String,
      required: [true, "Secure storage key is required"],
      trim: true,
      maxlength: 1000,
      select: false,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

employeeDocumentSchema.index({ employeeId: 1, category: 1 });

export const EmployeeDocument = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);