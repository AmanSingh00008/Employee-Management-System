
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
      default: null,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
      default: "",
    },

    workEmail: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 254,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "intern"],
      default: "full_time",
    },

    employmentStatus: {
      type: String,
      enum: ["active", "on_leave", "resigned", "terminated"],
      default: "active",
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    exitDate: {
      type: Date,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      street: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      postalCode: { type: String, trim: true, maxlength: 20 },
      country: { type: String, trim: true, maxlength: 100 },
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

employeeSchema.index({ departmentId: 1, employmentStatus: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ workEmail: 1 }, { sparse: true });

export const Employee = mongoose.model("Employee", employeeSchema);
