
import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    layout: {
      type: String,
      enum: ["default", "compact", "detailed"],
      default: "default",
    },

    widgets: {
      type: [
        {
          type: String,
          enum: [
            "employee_stats",
            "department_stats",
            "leave_requests",
            "attendance",
            "recent_employees",
            "recent_notifications",
          ],
        },
      ],
      default: [
        "employee_stats",
        "department_stats",
        "leave_requests",
        "attendance",
        "recent_employees",
      ],
    },

    dateRange: {
      type: String,
      enum: ["today", "7_days", "30_days", "this_month"],
      default: "30_days",
    },

    preferences: {
      showCharts: {
        type: Boolean,
        default: true,
      },
      showRecentActivity: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Dashboard = mongoose.model("Dashboard", dashboardSchema);
