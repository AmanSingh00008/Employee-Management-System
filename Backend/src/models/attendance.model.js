
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    totalMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "late",
        "half_day",
        "on_leave",
        "holiday",
        "weekend",
      ],
      default: "present",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { employeeId: 1, date: 1 },
  { unique: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
