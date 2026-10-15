
import mongoose from "mongoose";

const assetAssignmentSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    expectedReturnAt: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    assignedCondition: {
      type: String,
      enum: ["new", "good", "fair", "damaged"],
      default: "good",
    },

    returnCondition: {
      type: String,
      enum: ["good", "fair", "damaged", "lost", null],
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

assetAssignmentSchema.index({ employeeId: 1, assignedAt: -1 });
assetAssignmentSchema.index({ assetId: 1, returnedAt: 1 });

export const AssetAssignment = mongoose.model(
  "AssetAssignment",
  assetAssignmentSchema
);
