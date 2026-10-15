
import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },

    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewComment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    isHalfDay: {
      type: Boolean,
      default: false,
    },

    halfDayPeriod: {
      type: String,
      enum: ["first_half", "second_half", null],
      default: null,
    },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ employeeId: 1, createdAt: -1 });
leaveRequestSchema.index({ status: 1, startDate: 1 });

export const LeaveRequest = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);