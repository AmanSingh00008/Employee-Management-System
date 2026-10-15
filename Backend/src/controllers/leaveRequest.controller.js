import { LeaveRequest } from "../models/leaveRequest.model.js";
import { LeaveBalance } from "../models/leaveBalance.model.js";
import { Employee } from "../models/employee.model.js";
import { LeaveType } from "../models/leaveType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { leaveTypeId, startDate, endDate, reason, isHalfDay, halfDayPeriod } =
    req.body;

  if (!leaveTypeId || !startDate || !endDate || !reason?.trim()) {
    throw new ApiError(400, "Required leave request fields are missing");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    throw new ApiError(400, "Invalid leave dates");
  }

  const employee = await Employee.findOne({
    userId: req.user._id,
    employmentStatus: "active",
  });

  if (!employee) {
    throw new ApiError(404, "No active employee profile found");
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

  if (isHalfDay && start.toDateString() !== end.toDateString()) {
    throw new ApiError(400, "Half-day leave must be for a single day");
  }

  const totalDays = isHalfDay
    ? 0.5
    : Math.floor((end - start) / 86400000) + 1;

  const year = start.getUTCFullYear();

  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    throw new ApiError(
      400,
      "Submit separate requests when leave crosses calendar years"
    );
  }

  const balance = await LeaveBalance.findOne({
    employeeId: employee._id,
    leaveTypeId,
    year,
  });

  if (!balance) {
    throw new ApiError(400, "No leave balance configured for this year");
  }

  if (
    balance.allocatedDays +
      balance.carriedForwardDays -
      balance.usedDays -
      balance.pendingDays <
    totalDays
  ) {
    throw new ApiError(400, "Insufficient leave balance");
  }

  const overlap = await LeaveRequest.exists({
    employeeId: employee._id,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlap) {
    throw new ApiError(409, "An overlapping leave request already exists");
  }

  const request = await LeaveRequest.create({
    employeeId: employee._id,
    leaveTypeId,
    startDate: start,
    endDate: end,
    totalDays,
    reason: reason.trim(),
    isHalfDay: Boolean(isHalfDay),
    halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
  });

  res.status(201).json({
    success: true,
    message: "Leave request submitted successfully",
    data: request,
  });
});

export const getLeaveRequests = asyncHandler(async (req, res) => {
  const filter = {};

  // Employees should only see their own requests.
  // HR/admin routes should use a separately authorized handler.
  if (req.query.scope !== "all") {
    const employee = await Employee.findOne({ userId: req.user._id });

    if (!employee) throw new ApiError(404, "Employee profile not found");

    filter.employeeId = employee._id;
  }

  if (req.query.status) filter.status = req.query.status;

  const requests = await LeaveRequest.find(filter)
    .populate("employeeId", "employeeCode firstName lastName workEmail")
    .populate("leaveTypeId", "name code")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

export const getLeaveRequestById = asyncHandler(async (req, res) => {
  const request = await LeaveRequest.findById(req.params.id)
    .populate("employeeId", "employeeCode firstName lastName workEmail")
    .populate("leaveTypeId", "name code")
    .populate("reviewedBy", "name email");

  if (!request) throw new ApiError(404, "Leave request not found");

  const employee = await Employee.findOne({ userId: req.user._id });
  const isOwner = employee && String(employee._id) === String(request.employeeId?._id);

  if (!isOwner && !["hr_admin", "super_admin"].includes(req.user.role)) {
    throw new ApiError(403, "You cannot access this leave request");
  }

  res.status(200).json({ success: true, data: request });
});

export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  const { status, reviewComment } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be approved or rejected");
  }

  const request = await LeaveRequest.findById(req.params.id);

  if (!request) throw new ApiError(404, "Leave request not found");

  if (request.status !== "pending") {
    throw new ApiError(409, "Only pending requests can be reviewed");
  }

  const balance = await LeaveBalance.findOne({
    employeeId: request.employeeId,
    leaveTypeId: request.leaveTypeId,
    year: request.startDate.getUTCFullYear(),
  });

  if (!balance) throw new ApiError(404, "Leave balance not found");

  // Production: perform the request and balance updates in a transaction.
  if (status === "approved") {
    if (balance.pendingDays < request.totalDays) {
      throw new ApiError(409, "Pending balance is inconsistent");
    }

    balance.pendingDays -= request.totalDays;
    balance.usedDays += request.totalDays;
  } else {
    balance.pendingDays = Math.max(
      0,
      balance.pendingDays - request.totalDays
    );
  }

  await balance.save();

  request.status = status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.reviewComment = reviewComment;
  await request.save();

  res.status(200).json({
    success: true,
    message: `Leave request ${status}`,
    data: request,
  });
});

export const cancelLeaveRequest = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user._id });

  if (!employee) throw new ApiError(404, "Employee profile not found");

  const request = await LeaveRequest.findOne({
    _id: req.params.id,
    employeeId: employee._id,
  });

  if (!request) throw new ApiError(404, "Leave request not found");

  if (!["pending", "approved"].includes(request.status)) {
    throw new ApiError(409, "This request cannot be cancelled");
  }

  const balance = await LeaveBalance.findOne({
    employeeId: request.employeeId,
    leaveTypeId: request.leaveTypeId,
    year: request.startDate.getUTCFullYear(),
  });

  if (balance) {
    if (request.status === "pending") {
      balance.pendingDays = Math.max(
        0,
        balance.pendingDays - request.totalDays
      );
    } else {
      balance.usedDays = Math.max(0, balance.usedDays - request.totalDays);
    }

    await balance.save();
  }

  request.status = "cancelled";
  await request.save();

  res.status(200).json({
    success: true,
    message: "Leave request cancelled",
    data: request,
  });
});