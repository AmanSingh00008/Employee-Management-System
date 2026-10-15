
import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const safeUserFields = "name email role status lastLoginAt createdAt updatedAt";

export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  const filter = {};

  if (req.query.role) {
    const roles = [
      "super_admin",
      "hr_admin",
      "manager",
      "employee",
    ];

    if (!roles.includes(req.query.role)) {
      throw new ApiError(400, "Invalid user role");
    }

    filter.role = req.query.role;
  }

  if (req.query.status) {
    const statuses = ["active", "inactive", "locked"];

    if (!statuses.includes(req.query.status)) {
      throw new ApiError(400, "Invalid user status");
    }

    filter.status = req.query.status;
  }

  if (req.query.search?.trim()) {
    const escaped = req.query.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(safeUserFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(id)
    .select(safeUserFields)
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await User.findById(req.user._id)
    .select(safeUserFields)
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const allowedFields = ["name", "email", "role", "status"];

  const suppliedFields = allowedFields.filter((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field)
  );

  if (suppliedFields.length === 0) {
    throw new ApiError(400, "No valid fields provided");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // A user must not elevate their own role through this endpoint.
  if (
    String(req.user?._id) === String(id) &&
    suppliedFields.includes("role")
  ) {
    throw new ApiError(
      403,
      "You cannot change your own role"
    );
  }

  if (req.body.name !== undefined) {
    if (
      typeof req.body.name !== "string" ||
      req.body.name.trim().length < 2
    ) {
      throw new ApiError(400, "Name must contain at least 2 characters");
    }

    user.name = req.body.name.trim();
  }

  if (req.body.email !== undefined) {
    if (typeof req.body.email !== "string") {
      throw new ApiError(400, "Invalid email");
    }

    const email = req.body.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, "Please provide a valid email");
    }

    const duplicate = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new ApiError(409, "Email is already in use");
    }

    user.email = email;
  }

  if (req.body.role !== undefined) {
    const allowedRoles = [
      "super_admin",
      "hr_admin",
      "manager",
      "employee",
    ];

    if (!allowedRoles.includes(req.body.role)) {
      throw new ApiError(400, "Invalid role");
    }

    user.role = req.body.role;
  }

  if (req.body.status !== undefined) {
    const allowedStatuses = ["active", "inactive", "locked"];

    if (!allowedStatuses.includes(req.body.status)) {
      throw new ApiError(400, "Invalid status");
    }

    user.status = req.body.status;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (String(req.user?._id) === String(id)) {
    throw new ApiError(
      400,
      "You cannot deactivate your own account through this endpoint"
    );
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Avoid leaving an active employee profile linked to an inactive account.
  user.status = "inactive";
  await user.save();

  await Employee.updateOne(
    { userId: user._id, employmentStatus: "active" },
    { $set: { employmentStatus: "on_leave" } }
  );

  res.status(200).json({
    success: true,
    message: "User account deactivated successfully",
  });
});
