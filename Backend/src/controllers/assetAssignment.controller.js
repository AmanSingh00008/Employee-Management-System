
import mongoose from "mongoose";
import { AssetAssignment } from "../models/assetAssignment.model.js";
import { Asset } from "../models/asset.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const requireHR = (user) => {
  if (!HR_ROLES.includes(user.role)) {
    throw new ApiError(403, "HR/Admin permission required");
  }
};

const validateId = (id, label = "ID") => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const getEmployeeProfile = async (userId) => {
  const employee = await Employee.findOne({ userId }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  return employee;
};

const ensureEmployeeAccess = async (employeeId, user) => {
  if (HR_ROLES.includes(user.role)) return;

  const employee = await Employee.findById(employeeId).select(
    "_id userId managerId"
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // Employees can see only their own assignments.
  if (
    user.role === "employee" &&
    String(employee.userId) === String(user._id)
  ) {
    return;
  }

  // Managers can see themselves and direct reports.
  if (user.role === "manager") {
    const manager = await getEmployeeProfile(user._id);

    if (
      String(employee._id) === String(manager._id) ||
      String(employee.managerId) === String(manager._id)
    ) {
      return;
    }
  }

  throw new ApiError(403, "You cannot access this employee's assignments");
};

// POST /api/v1/asset-assignments
export const assignAsset = asyncHandler(async (req, res) => {
  requireHR(req.user);

  const {
    assetId,
    employeeId,
    expectedReturnAt,
    assignedCondition = "good",
    notes,
  } = req.body;

  validateId(assetId, "asset ID");
  validateId(employeeId, "employee ID");

  const [asset, employee] = await Promise.all([
    Asset.findById(assetId),
    Employee.findById(employeeId).select("_id employmentStatus"),
  ]);

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.employmentStatus !== "active") {
    throw new ApiError(400, "Asset can only be assigned to an active employee");
  }

  if (asset.status !== "available") {
    throw new ApiError(409, "Asset is not available for assignment");
  }

  if (!["good", "fair", "damaged"].includes(assignedCondition)) {
    throw new ApiError(400, "Invalid assigned condition");
  }

  let returnDate;

  if (expectedReturnAt) {
    returnDate = new Date(expectedReturnAt);

    if (Number.isNaN(returnDate.getTime())) {
      throw new ApiError(400, "Invalid expected return date");
    }

    if (returnDate <= new Date()) {
      throw new ApiError(400, "Expected return date must be in the future");
    }
  }

  // The unique index on AssetAssignment is not enough to prevent
  // concurrent assignment races; use a transaction and atomic asset update.
  const session = await mongoose.startSession();
  let assignment;

  try {
    await session.withTransaction(async () => {
      const updatedAsset = await Asset.findOneAndUpdate(
        { _id: assetId, status: "available" },
        { $set: { status: "assigned" } },
        { new: true, session }
      );

      if (!updatedAsset) {
        throw new ApiError(409, "Asset is no longer available");
      }

      const [created] = await AssetAssignment.create(
        [
          {
            assetId,
            employeeId,
            assignedBy: req.user._id,
            assignedAt: new Date(),
            expectedReturnAt: returnDate,
            assignedCondition,
            notes: notes?.trim(),
          },
        ],
        { session }
      );

      assignment = created;
    });
  } finally {
    await session.endSession();
  }

  return res.status(201).json({
    success: true,
    message: "Asset assigned successfully",
    data: assignment,
  });
});

// GET /api/v1/asset-assignments
export const getAssetAssignments = asyncHandler(async (req, res) => {
  const {
    employeeId,
    assetId,
    activeOnly = "true",
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  if (assetId) {
    validateId(assetId, "asset ID");
    filter.assetId = assetId;
  }

  if (activeOnly === "true") {
    filter.returnedAt = null;
  } else if (activeOnly !== "false") {
    throw new ApiError(400, "activeOnly must be true or false");
  }

  if (HR_ROLES.includes(req.user.role)) {
    if (employeeId) {
      validateId(employeeId, "employee ID");
      filter.employeeId = employeeId;
    }
  } else if (employeeId) {
    validateId(employeeId, "employee ID");
    await ensureEmployeeAccess(employeeId, req.user);
    filter.employeeId = employeeId;
  } else if (req.user.role === "employee") {
    const employee = await getEmployeeProfile(req.user._id);
    filter.employeeId = employee._id;
  } else if (req.user.role === "manager") {
    const manager = await getEmployeeProfile(req.user._id);
    const teamIds = await Employee.find({
      managerId: manager._id,
    }).distinct("_id");

    filter.employeeId = { $in: [manager._id, ...teamIds] };
  } else {
    throw new ApiError(403, "You cannot access asset assignments");
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const [assignments, total] = await Promise.all([
    AssetAssignment.find(filter)
      .populate("assetId")
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("assignedBy", "name email")
      .sort({ assignedAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    AssetAssignment.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: assignments,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/asset-assignments/:id
export const getAssetAssignmentById = asyncHandler(async (req, res) => {
  validateId(req.params.id, "assignment ID");

  const assignment = await AssetAssignment.findById(req.params.id)
    .populate("assetId")
    .populate("employeeId", "firstName lastName employeeCode")
    .populate("assignedBy", "name email");

  if (!assignment) {
    throw new ApiError(404, "Asset assignment not found");
  }

  await ensureEmployeeAccess(assignment.employeeId._id, req.user);

  return res.status(200).json({
    success: true,
    data: assignment,
  });
});

// PATCH /api/v1/asset-assignments/:id/return
export const returnAsset = asyncHandler(async (req, res) => {
  requireHR(req.user);
  validateId(req.params.id, "assignment ID");

  const { returnCondition = "good", notes } = req.body;

  if (!["good", "fair", "damaged"].includes(returnCondition)) {
    throw new ApiError(400, "Invalid return condition");
  }

  const session = await mongoose.startSession();
  let returnedAssignment;

  try {
    await session.withTransaction(async () => {
      const assignment = await AssetAssignment.findById(
        req.params.id
      ).session(session);

      if (!assignment) {
        throw new ApiError(404, "Asset assignment not found");
      }

      if (assignment.returnedAt) {
        throw new ApiError(409, "This asset has already been returned");
      }

      const asset = await Asset.findOneAndUpdate(
        { _id: assignment.assetId, status: "assigned" },
        {
          $set: {
            status: returnCondition === "damaged" ? "maintenance" : "available",
          },
        },
        { new: true, session }
      );

      if (!asset) {
        throw new ApiError(
          409,
          "Asset status is inconsistent; cannot complete return"
        );
      }

      assignment.returnedAt = new Date();
      assignment.returnCondition = returnCondition;

      if (notes?.trim()) {
        assignment.notes = [assignment.notes, notes.trim()]
          .filter(Boolean)
          .join("\n");
      }

      await assignment.save({ session });
      returnedAssignment = assignment;
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json({
    success: true,
    message: "Asset returned successfully",
    data: returnedAssignment,
  });
});
