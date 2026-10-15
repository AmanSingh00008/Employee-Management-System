
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyReportHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

  const filter = { generatedBy: req.user._id };

  if (req.query.reportType) {
    const allowedTypes = [
      "employees",
      "attendance",
      "leave_requests",
      "departments",
    ];

    if (!allowedTypes.includes(req.query.reportType)) {
      throw new ApiError(400, "Invalid report type");
    }

    filter.reportType = req.query.reportType;
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .select("-errorMessage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("generatedBy", "name email")
      .lean(),
    Report.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
