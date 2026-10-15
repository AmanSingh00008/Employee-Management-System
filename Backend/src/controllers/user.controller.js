
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Employee } from "../models/employee.model.js";
import { RefreshSession } from "../models/refreshSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];
const ALL_ROLES = ["super_admin", "hr_admin", "manager", "employee"];
const ALL_STATUSES = ["active", "inactive", "locked"];

const safeUserFields = "name email role status lastLoginAt createdAt updatedAt";

const requireRoles = (user, ...roles) => {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
};

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID");
  }
};

// GET /api/v1/users/me
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(safeUserFields);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// GET /api/v1/users
// HR/Admin can list users. Managers and employees cannot.
export const getUsers = asyncHandler(async (req, res) => {
  requireRoles(req.user, ...HR_ROLES);

  const {
    page = 1,
    limit = 10,
    search,
    role,
    status,
  } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (role) {
    if (!ALL_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid role filter");
    }
    filter.role = role;
  }

  if (status) {
    if (!ALL_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid status filter");
    }
    filter.status = status;
  }

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(safeUserFields)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const isSelf = String(req.params.id) === String(req.user._id);
  const isHR = HR_ROLES.includes(req.user.role);

  if (!isSelf && !isHR) {
    throw new ApiError(403, "You cannot access this user's details");
  }

  const user = await User.findById(req.params.id).select(safeUserFields);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// PATCH /api/v1/users/:id
// Users may update their own name/email.
// Only Super Admin may change another user's role or status.
export const updateUser = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const isSelf = String(targetUser._id) === String(req.user._id);
  const isSuperAdmin = req.user.role === "super_admin";

  const allowedFields = ["name", "email", "role", "status"];
  const unknownFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length) {
    throw new ApiError(
      400,
      `Unsupported fields: ${unknownFields.join(", ")}`
    );
  }

  const updates = {};

  if (Object.hasOwn(req.body, "name")) {
    if (
      typeof req.body.name !== "string" ||
      !req.body.name.trim()
    ) {
      throw new ApiError(400, "Name cannot be empty");
    }

    updates.name = req.body.name.trim();
  }

  if (Object.hasOwn(req.body, "email")) {
    if (
      typeof req.body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email.trim())
    ) {
      throw new ApiError(400, "Valid email is required");
    }

    updates.email = req.body.email.trim().toLowerCase();
  }

  // Only Super Admin can change roles.
  if (Object.hasOwn(req.body, "role")) {
    if (!isSuperAdmin) {
      throw new ApiError(403, "Only Super Admin can change user roles");
    }

    if (!ALL_ROLES.includes(req.body.role)) {
      throw new ApiError(400, "Invalid user role");
    }

    if (
      targetUser.role === "super_admin" &&
      req.body.role !== "super_admin"
    ) {
      const count = await User.countDocuments({
        role: "super_admin",
        status: "active",
      });

      if (count <= 1 && targetUser.status === "active") {
        throw new ApiError(
          409,
          "Cannot demote the last active Super Admin"
        );
      }
    }

    updates.role = req.body.role;
  }

  // Only Super Admin can change status.
  if (Object.hasOwn(req.body, "status")) {
    if (!isSuperAdmin) {
      throw new ApiError(403, "Only Super Admin can change user status");
    }

    if (!ALL_STATUSES.includes(req.body.status)) {
      throw new ApiError(400, "Invalid user status");
    }

    if (
      targetUser.role === "super_admin" &&
      targetUser.status === "active" &&
      req.body.status !== "active"
    ) {
      const activeSuperAdmins = await User.countDocuments({
        role: "super_admin",
        status: "active",
      });

      if (activeSuperAdmins <= 1) {
        throw new ApiError(
          409,
          "Cannot deactivate or lock the last active Super Admin"
        );
      }
    }

    updates.status = req.body.status;
  }

  // Users cannot edit their own role/status, even if a future
  // route mistakenly permits the request.
  if (isSelf && ("role" in updates || "status" in updates)) {
    throw new ApiError(403, "You cannot change your own role or status");
  }

  if (updates.email && updates.email !== targetUser.email) {
    const duplicate = await User.findOne({
      email: updates.email,
      _id: { $ne: targetUser._id },
    }).select("_id");

    if (duplicate) {
      throw new ApiError(409, "Email is already in use");
    }
  }

  targetUser.set(updates);
  await targetUser.save();

  // If account is locked or inactive, revoke active refresh sessions.
  if (
    updates.status &&
    updates.status !== "active"
  ) {
    await RefreshSession.updateMany(
      { userId: targetUser._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  }

  const safeUser = await User.findById(targetUser._id).select(
    safeUserFields
  );

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: safeUser,
  });
});

// DELETE /api/v1/users/:id
// Soft-deactivate the account; do not delete historical records.
export const deactivateUser = asyncHandler(async (req, res) => {
  requireRoles(req.user, "super_admin");
  validateId(req.params.id);

  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser.status === "inactive") {
    throw new ApiError(409, "User is already inactive");
  }

  if (
    targetUser.role === "super_admin" &&
    targetUser.status === "active"
  ) {
    const activeSuperAdmins = await User.countDocuments({
      role: "super_admin",
      status: "active",
    });

    if (activeSuperAdmins <= 1) {
      throw new ApiError(
        409,
        "Cannot deactivate the last active Super Admin"
      );
    }
  }

  targetUser.status = "inactive";
  await targetUser.save();

  await RefreshSession.updateMany(
    { userId: targetUser._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  return res.status(200).json({
    success: true,
    message: "User deactivated successfully",
  });
});
