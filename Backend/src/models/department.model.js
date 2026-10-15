
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    code: {
      type: String,
      required: [true, "Department code is required"],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 20,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    departmentHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.index({ name: 1 });

export const Department = mongoose.model(
  "Department",
  departmentSchema
);