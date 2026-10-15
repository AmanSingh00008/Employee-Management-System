
import mongoose from "mongoose";
import { LeaveBalance } from "../models/leaveBalance.model.js";
import { LeaveType } from "../models/leaveType.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const getEmployeeProfile = async (userId) => {
  const employee = await Employee.findOne({ userId }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  return employee;
};

const getAuthorizedEmployeeIds = async (user) => {
  if (HR_ROLES.includes(user.role)) {
    return null; // null means unrestricted HR/Admin scope
  }

  const employee = await getEmployeeProfile(user._id);

  if (user.role === "manager") {
    const teamIds = await Employee.find({
      managerId: employee._id,
    }).distinct("_id");

    return [employee._id, ...teamIds];
  }

  return [employee._id];
};

// GET /api/v1/leave-balances
export const getLeaveBalances = asyncHandler(async (req, res) => {
  const {
    employeeId,
    year = new Date().getFullYear(),
    page = 1,
    limit = 10,
  } = req.query;

  const selectedYear = Number(year);

  if (!Number.isInteger(selectedYear) ||
      selectedYear < 2000 ||
      selectedYear > 2100) {
    throw new ApiError(400, "Invalid leave balance year");
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const allowedIds = await getAuthorizedEmployeeIds(req.user);
  const filter = { year: selectedYear };

  if (allowedIds !== null) {
    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID");
      }

      if (!allowedIds.some((id) => String(id) === String(employeeId))) {
        throw new ApiError(403, "You cannot access this employee's balances");
      }

      filter.employeeId = employeeId;
    } else if (req.user.role === "manager") {
      filter.employeeId = { $in: allowedIds };
    } else {
      filter.employeeId = allowedIds[0];
    }
  } else if (employeeId) {
    if (!mongoose.isValidObjectId(employeeId)) {
      throw new ApiError(400, "Invalid employee ID");
    }

    filter.employeeId = employeeId;
  }

  const [balances, total] = await Promise.all([
    LeaveBalance.find(filter)
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("leaveTypeId", "name code isPaid")
      .sort({ employeeId: 1, leaveTypeId: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    LeaveBalance.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: balances,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/leave-balances/:id
export const getLeaveBalanceById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid leave balance ID");
  }

  const balance = await LeaveBalance.findById(req.params.id)
    .populate("employeeId", "firstName lastName employeeCode managerId")
    .populate("leaveTypeId", "name code isPaid");

  if (!balance) {
    throw new ApiError(404, "Leave balance not found");
  }

  const allowedIds = await getAuthorizedEmployeeIds(req.user);

  if (
    allowedIds !== null &&
    !allowedIds.some(
      (id) => String(id) === String(balance.employeeId._id)
    )
  ) {
    throw new ApiError(403, "You cannot access this leave balance");
  }

  return res.status(200).json({
    success: true,
    data: balance,
  });
});

// POST /api/v1/leave-balances
// HR/Admin can create or update an allocation.
export const createOrUpdateLeaveBalance = asyncHandler(
  async (req, res) => {
    const {
      employeeId,
      leaveTypeId,
      year,
      allocatedDays,
      carriedForwardDays = 0,
    } = req.body;

    if (
      !mongoose.isValidObjectId(employeeId) ||
      !mongoose.isValidObjectId(leaveTypeId)
    ) {
      throw new ApiError(400, "Valid employee and leave type IDs are required");
    }

    const selectedYear = Number(year);

    if (!Number.isInteger(selectedYear) ||
        selectedYear < 2000 ||
        selectedYear > 2100) {
      throw new ApiError(400, "Invalid leave balance year");
    }

    if (
      !Number.isFinite(allocatedDays) ||
      allocatedDays < 0 ||
      !Number.isFinite(carriedForwardDays) ||
      carriedForwardDays < 0
    ) {
      throw new ApiError(400, "Leave allocations must be non-negative numbers");
    }

    const [employee, leaveType] = await Promise.all([
      Employee.findById(employeeId).select("_id"),
      LeaveType.findOne({ _id: leaveTypeId, isActive: true }),
    ]);

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    if (!leaveType) {
      throw new ApiError(404, "Active leave type not found");
    }

    const balance = await LeaveBalance.findOneAndUpdate(
      { employeeId, leaveTypeId, year: selectedYear },
      {
        $set: {
          allocatedDays,
          carriedForwardDays,
        },
        $setOnInsert: {
          employeeId,
          leaveTypeId,
          year: selectedYear,
          usedDays: 0,
          pendingDays: 0,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Leave balance allocation saved",
      data: balance,
    });
  }
);

// PATCH /api/v1/leave-balances/:id/allocation
// Update allocation only; never overwrite used/pending days.
export const updateLeaveAllocation = asyncHandler(
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, "Invalid leave balance ID");
    }

    const updates = {};
    const allowedFields = ["allocatedDays", "carriedForwardDays"];

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        const value = req.body[field];

        if (!Number.isFinite(value) || value < 0) {
          throw new ApiError(
            400,
            `${field} must be a non-negative number`
          );
        }

        updates[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid allocation fields provided");
    }

    const balance = await LeaveBalance.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("leaveTypeId", "name code");

    if (!balance) {
      throw new ApiError(404, "Leave balance not found");
    }

    return res.status(200).json({
      success: true,
      message: "Leave allocation updated",
      data: balance,
    });
  }
);
