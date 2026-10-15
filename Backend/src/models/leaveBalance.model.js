
import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
    },

    allocatedDays: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    usedDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    pendingDays: {
      type: Number,
      min: 0,
      default: 0,
    },

    carriedForwardDays: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

leaveBalanceSchema.index(
  { employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true }
);

leaveBalanceSchema.virtual("availableDays").get(function () {
  return Math.max(
    0,
    this.allocatedDays +
      this.carriedForwardDays -
      this.usedDays -
      this.pendingDays
  );
});

leaveBalanceSchema.set("toJSON", { virtuals: true });
leaveBalanceSchema.set("toObject", { virtuals: true });

export const LeaveBalance = mongoose.model(
  "LeaveBalance",
  leaveBalanceSchema
);