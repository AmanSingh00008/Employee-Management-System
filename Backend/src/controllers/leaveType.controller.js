import { LeaveType } from "../models/leaveType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createLeaveType = asyncHandler(async (req, res) => {
  const { name, code, description, defaultDaysPerYear, isPaid, allowHalfDay } =
    req.body;

  if (!name?.trim() || !code?.trim()) {
    throw new ApiError(400, "Leave type name and code are required");
  }

  const leaveType = await LeaveType.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description,
    defaultDaysPerYear,
    isPaid,
    allowHalfDay,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Leave type created successfully",
    data: leaveType,
  });
});

export const getLeaveTypes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const [leaveTypes, total] = await Promise.all([
    LeaveType.find(filter)
      .sort({ name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    LeaveType.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: leaveTypes,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getLeaveTypeById = asyncHandler(async (req, res) => {
  const leaveType = await LeaveType.findById(req.params.id);

  if (!leaveType) {
    throw new ApiError(404, "Leave type not found");
  }

  res.status(200).json({ success: true, data: leaveType });
});

export const updateLeaveType = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "description",
    "defaultDaysPerYear",
    "isPaid",
    "allowHalfDay",
    "isActive",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.defaultDaysPerYear !== undefined &&
      (!Number.isFinite(updates.defaultDaysPerYear) ||
       updates.defaultDaysPerYear < 0)) {
    throw new ApiError(400, "Invalid default leave allocation");
  }

  const leaveType = await LeaveType.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!leaveType) {
    throw new ApiError(404, "Leave type not found");
  }

  res.status(200).json({
    success: true,
    message: "Leave type updated successfully",
    data: leaveType,
  });
});

export const deactivateLeaveType = asyncHandler(async (req, res) => {
  const leaveType = await LeaveType.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    { new: true }
  );

  if (!leaveType) {
    throw new ApiError(404, "Leave type not found");
  }

  res.status(200).json({
    success: true,
    message: "Leave type deactivated successfully",
    data: leaveType,
  });
});