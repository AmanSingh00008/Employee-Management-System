import { LeaveBalance } from "../models/leaveBalance.model.js";
import { Employee } from "../models/employee.model.js";
import { LeaveType } from "../models/leaveType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLeaveBalances = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.employeeId) {
    filter.employeeId = req.query.employeeId;
  }

  if (req.query.year) {
    const year = Number(req.query.year);

    if (!Number.isInteger(year)) {
      throw new ApiError(400, "Invalid year");
    }

    filter.year = year;
  }

  if (req.query.leaveTypeId) {
    filter.leaveTypeId = req.query.leaveTypeId;
  }

  const balances = await LeaveBalance.find(filter)
    .populate("employeeId", "employeeCode firstName lastName workEmail")
    .populate("leaveTypeId", "name code defaultDaysPerYear")
    .sort({ year: -1 });

  res.status(200).json({ success: true, data: balances });
});

export const getLeaveBalanceById = asyncHandler(async (req, res) => {
  const balance = await LeaveBalance.findById(req.params.id)
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("leaveTypeId", "name code");

  if (!balance) {
    throw new ApiError(404, "Leave balance not found");
  }

  res.status(200).json({ success: true, data: balance });
});

export const createOrUpdateLeaveBalance = asyncHandler(async (req, res) => {
  const {
    employeeId,
    leaveTypeId,
    year,
    allocatedDays,
    carriedForwardDays = 0,
  } = req.body;

  if (!employeeId || !leaveTypeId || !year ||
      allocatedDays === undefined) {
    throw new ApiError(400, "Required leave balance fields are missing");
  }

  const parsedYear = Number(year);

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isFinite(allocatedDays) ||
    allocatedDays < 0 ||
    !Number.isFinite(carriedForwardDays) ||
    carriedForwardDays < 0
  ) {
    throw new ApiError(400, "Invalid year or leave allocation");
  }

  const [employee, leaveType] = await Promise.all([
    Employee.findById(employeeId),
    LeaveType.findById(leaveTypeId),
  ]);

  if (!employee) throw new ApiError(404, "Employee not found");
  if (!leaveType) throw new ApiError(404, "Leave type not found");

  const balance = await LeaveBalance.findOneAndUpdate(
    { employeeId, leaveTypeId, year: parsedYear },
    {
      $set: { allocatedDays, carriedForwardDays },
      $setOnInsert: { usedDays: 0, pendingDays: 0 },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Leave balance saved successfully",
    data: balance,
  });
});

export const updateLeaveAllocation = asyncHandler(async (req, res) => {
  const { allocatedDays, carriedForwardDays } = req.body;
  const updates = {};

  if (allocatedDays !== undefined) {
    if (!Number.isFinite(allocatedDays) || allocatedDays < 0) {
      throw new ApiError(400, "Invalid allocated days");
    }
    updates.allocatedDays = allocatedDays;
  }

  if (carriedForwardDays !== undefined) {
    if (!Number.isFinite(carriedForwardDays) || carriedForwardDays < 0) {
      throw new ApiError(400, "Invalid carried-forward days");
    }
    updates.carriedForwardDays = carriedForwardDays;
  }

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "No valid fields provided");
  }

  const balance = await LeaveBalance.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!balance) throw new ApiError(404, "Leave balance not found");

  res.status(200).json({
    success: true,
    message: "Leave allocation updated",
    data: balance,
  });
});