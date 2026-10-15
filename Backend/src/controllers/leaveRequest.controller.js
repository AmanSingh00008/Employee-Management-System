
import mongoose from "mongoose";
import { LeaveRequest } from "../models/leaveRequest.model.js";
import { LeaveBalance } from "../models/leaveBalance.model.js";
import { LeaveType } from "../models/leaveType.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const getEmployeeProfile = async (userId) => {
  const employee = await Employee.findOne({ userId }).select(
    "_id userId managerId employmentStatus"
  );

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  if (employee.employmentStatus !== "active") {
    throw new ApiError(403, "Active employee profile required");
  }

  return employee;
};

const canAccessRequest = async (request, user) => {
  if (HR_ROLES.includes(user.role)) return true;

  const employee = await Employee.findOne({
    userId: user._id,
  }).select("_id");

  if (!employee) return false;

  // Employees can access their own requests.
  if (String(request.employeeId) === String(employee._id)) {
    return true;
  }

  // Managers can access direct reports' requests.
  if (user.role === "manager") {
    const target = await Employee.findById(request.employeeId)
      .select("managerId");

    return (
      target &&
      String(target.managerId) === String(employee._id)
    );
  }

  return false;
};

const getLeaveBalance = async (employeeId, leaveTypeId, year) => {
  return LeaveBalance.findOne({
    employeeId,
    leaveTypeId,
    year,
  });
};

// POST /api/v1/leave-requests
export const createLeaveRequest = asyncHandler(
  async (req, res) => {
    const employee = await getEmployeeProfile(req.user._id);

    const { leaveTypeId, startDate, endDate, reason, isHalfDay, halfDayPeriod } =
      req.body;

    if (!leaveTypeId || !startDate || !endDate || !reason?.trim()) {
      throw new ApiError(
        400,
        "Leave type, start date, end date and reason are required"
      );
    }

    if (!mongoose.isValidObjectId(leaveTypeId)) {
      throw new ApiError(400, "Invalid leave type ID");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start > end
    ) {
      throw new ApiError(400, "Invalid leave date range");
    }

    // This implementation supports one calendar year per request.
    if (start.getUTCFullYear() !== end.getUTCFullYear()) {
      throw new ApiError(
        400,
        "Please create separate requests for different calendar years"
      );
    }

    // Compare date-only values in UTC to avoid time-of-day differences.
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (start < today) {
      throw new ApiError(400, "Past leave dates are not allowed");
    }

    if (isHalfDay && start.getTime() !== end.getTime()) {
      throw new ApiError(400, "Half-day leave must be for one day");
    }

    if (
      isHalfDay &&
      !["first_half", "second_half"].includes(halfDayPeriod)
    ) {
      throw new ApiError(400, "Valid half-day period is required");
    }

    const leaveType = await LeaveType.findOne({
      _id: leaveTypeId,
      isActive: true,
    });

    if (!leaveType) {
      throw new ApiError(404, "Active leave type not found");
    }

    if (isHalfDay && !leaveType.allowHalfDay) {
      throw new ApiError(400, "Half-day leave is not allowed for this type");
    }

    // Calendar days for now. Replace with working-day calculation
    // if weekends and holidays should be excluded.
    const totalDays = isHalfDay
      ? 0.5
      : Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    const year = start.getUTCFullYear();

    // A transaction keeps the request and balance consistent.
    const session = await mongoose.startSession();
    let createdRequest;

    try {
      await session.withTransaction(async () => {
        const balance = await LeaveBalance.findOne({
          employeeId: employee._id,
          leaveTypeId,
          year,
        }).session(session);

        if (!balance) {
          throw new ApiError(
            400,
            "Leave balance not configured for this year"
          );
        }

        // Atomic check prevents two concurrent requests from
        // overspending the same balance.
        const updatedBalance = await LeaveBalance.findOneAndUpdate(
          {
            _id: balance._id,
            $expr: {
              $gte: [
                {
                  $subtract: [
                    {
                      $add: [
                        "$allocatedDays",
                        "$carriedForwardDays",
                      ],
                    },
                    {
                      $add: ["$usedDays", "$pendingDays"],
                    },
                  ],
                },
                totalDays,
              ],
            },
          },
          { $inc: { pendingDays: totalDays } },
          { new: true, session }
        );

        if (!updatedBalance) {
          throw new ApiError(400, "Insufficient leave balance");
        }

        [createdRequest] = await LeaveRequest.create(
          [
            {
              employeeId: employee._id,
              leaveTypeId,
              startDate: start,
              endDate: end,
              totalDays,
              reason: reason.trim(),
              status: "pending",
              isHalfDay: Boolean(isHalfDay),
              halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Leave request created",
      data: createdRequest,
    });
  }
);

// GET /api/v1/leave-requests
export const getLeaveRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (status) {
    if (!["pending", "approved", "rejected", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid leave request status");
    }
    filter.status = status;
  }

  if (HR_ROLES.includes(req.user.role)) {
    // HR may list all requests.
  } else {
    const employee = await getEmployeeProfile(req.user._id);

    if (req.user.role === "manager" && req.query.scope === "team") {
      const team = await Employee.find({
        managerId: employee._id,
      }).distinct("_id");

      filter.employeeId = { $in: [employee._id, ...team] };
    } else {
      // Employees cannot broaden their query with ?scope=all.
      filter.employeeId = employee._id;
    }
  }

  const [requests, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("leaveTypeId", "name code")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    LeaveRequest.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: requests,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/leave-requests/:id
export const getLeaveRequestById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid leave request ID");
  }

  const request = await LeaveRequest.findById(req.params.id)
    .populate("employeeId", "firstName lastName employeeCode")
    .populate("leaveTypeId", "name code")
    .populate("reviewedBy", "name email");

  if (!request) {
    throw new ApiError(404, "Leave request not found");
  }

  if (!(await canAccessRequest(request, req.user))) {
    throw new ApiError(403, "You cannot access this leave request");
  }

  return res.status(200).json({
    success: true,
    data: request,
  });
});

// PATCH /api/v1/leave-requests/:id/review
export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  if (!HR_ROLES.includes(req.user.role) && req.user.role !== "manager") {
    throw new ApiError(403, "You cannot review leave requests");
  }

  const { status, reviewComment } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid leave request ID");
  }

  const session = await mongoose.startSession();
  let reviewedRequest;

  try {
    await session.withTransaction(async () => {
      const request = await LeaveRequest.findById(req.params.id).session(session);

      if (!request) {
        throw new ApiError(404, "Leave request not found");
      }

      if (request.status !== "pending") {
        throw new ApiError(409, "Only pending requests can be reviewed");
      }

      // HR may review any request. A manager may review only a
      // direct report's request, and not their own.
      if (!HR_ROLES.includes(req.user.role)) {
        const manager = await getEmployeeProfile(req.user._id);

        if (String(manager._id) === String(request.employeeId)) {
          throw new ApiError(403, "You cannot approve your own leave");
        }

        const target = await Employee.findById(request.employeeId)
          .select("managerId")
          .session(session);

        if (!target || String(target.managerId) !== String(manager._id)) {
          throw new ApiError(403, "You can review only direct reports");
        }
      }

      const year = new Date(request.startDate).getUTCFullYear();

      const balance = await LeaveBalance.findOne({
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        year,
      }).session(session);

      if (!balance || balance.pendingDays < request.totalDays) {
        throw new ApiError(409, "Leave balance is inconsistent");
      }

      const increments = { pendingDays: -request.totalDays };

      if (status === "approved") {
        increments.usedDays = request.totalDays;
      }

      await LeaveBalance.updateOne(
        { _id: balance._id },
        { $inc: increments },
        { session }
      );

      request.status = status;
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      request.reviewComment = reviewComment?.trim() || undefined;

      await request.save({ session });
      reviewedRequest = request;
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({
    success: true,
    message: `Leave request ${status}`,
    data: reviewedRequest,
  });
});

// PATCH /api/v1/leave-requests/:id/cancel
export const cancelLeaveRequest = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid leave request ID");
  }

  const employee = await getEmployeeProfile(req.user._id);
  const session = await mongoose.startSession();
  let cancelledRequest;

  try {
    await session.withTransaction(async () => {
      const request = await LeaveRequest.findOne({
        _id: req.params.id,
        employeeId: employee._id,
      }).session(session);

      if (!request) {
        throw new ApiError(404, "Leave request not found");
      }

      if (request.status !== "pending") {
        throw new ApiError(409, "Only pending requests can be cancelled");
      }

      const year = new Date(request.startDate).getUTCFullYear();

      const balance = await LeaveBalance.findOne({
        employeeId: employee._id,
        leaveTypeId: request.leaveTypeId,
        year,
      }).session(session);

      if (!balance || balance.pendingDays < request.totalDays) {
        throw new ApiError(409, "Leave balance is inconsistent");
      }

      await LeaveBalance.updateOne(
        { _id: balance._id },
        { $inc: { pendingDays: -request.totalDays } },
        { session }
      );

      request.status = "cancelled";
      await request.save({ session });

      cancelledRequest = request;
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({
    success: true,
    message: "Leave request cancelled",
    data: cancelledRequest,
  });
});
