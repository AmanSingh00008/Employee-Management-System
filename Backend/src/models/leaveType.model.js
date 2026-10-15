
import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Leave type name is required"],
      trim: true,
      maxlength: 100,
    },

    code: {
      type: String,
      required: [true, "Leave type code is required"],
      trim: true,
      uppercase: true,
      maxlength: 30,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    defaultDaysPerYear: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    allowHalfDay: {
      type: Boolean,
      default: false,
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
  { timestamps: true }
);

export const LeaveType = mongoose.model("LeaveType", leaveTypeSchema);
