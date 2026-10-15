
import mongoose from "mongoose";
import { Department } from "../models/department.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const requireHR = (user) => {
  if (!HR_ROLES.includes(user.role)) {
    throw new ApiError(403, "HR/Admin permission required");
  }
};

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid department ID");
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/v1/departments
export const createDepartment = asyncHandler(async (req, res) => {
  requireHR(req.user);

  const { name, code, description, departmentHead } = req.body;

  if (!name?.trim() || !code?.trim()) {
    throw new ApiError(400, "Department name and code are required");
  }

  const normalizedName = name.trim();
  const normalizedCode = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
    throw new ApiError(
      400,
      "Department code may contain only letters, numbers, underscores and hyphens"
    );
  }

  if (departmentHead) {
    if (!mongoose.isValidObjectId(departmentHead)) {
      throw new ApiError(400, "Invalid department head ID");
    }

    const head = await Employee.findOne({
      _id: departmentHead,
      employmentStatus: "active",
    });

    if (!head) {
      throw new ApiError(400, "Department head must be an active employee");
    }
  }

  const duplicate = await Department.findOne({
    $or: [
      { name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" } },
      { code: normalizedCode },
    ],
  }).select("_id");

  if (duplicate) {
    throw new ApiError(409, "Department name or code already exists");
  }

  const department = await Department.create({
    name: normalizedName,
    code: normalizedCode,
    description: description?.trim(),
    departmentHead: departmentHead || undefined,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: department,
  });
});

// GET /api/v1/departments
export const getDepartments = asyncHandler(async (req, res) => {
  const {
    search,
    isActive,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    if (!["true", "false"].includes(isActive)) {
      throw new ApiError(400, "isActive must be true or false");
    }

    filter.isActive = isActive === "true";
  }

  if (search?.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { name: regex },
      { code: regex },
      { description: regex },
    ];
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .populate("departmentHead", "firstName lastName employeeCode")
      .sort({ name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Department.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: departments,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/departments/:id
export const getDepartmentById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const department = await Department.findById(req.params.id).populate(
    "departmentHead",
    "firstName lastName employeeCode workEmail designation"
  );

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res.status(200).json({
    success: true,
    data: department,
  });
});

// PATCH /api/v1/departments/:id
export const updateDepartment = asyncHandler(async (req, res) => {
  requireHR(req.user);
  validateId(req.params.id);

  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const allowedFields = ["name", "code", "description", "departmentHead"];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid department fields provided");
  }

  if (Object.hasOwn(updates, "name")) {
    if (typeof updates.name !== "string" || !updates.name.trim()) {
      throw new ApiError(400, "Department name cannot be empty");
    }

    updates.name = updates.name.trim();
  }

  if (Object.hasOwn(updates, "code")) {
    if (typeof updates.code !== "string" || !updates.code.trim()) {
      throw new ApiError(400, "Department code cannot be empty");
    }

    updates.code = updates.code.trim().toUpperCase();

    if (!/^[A-Z0-9_-]+$/.test(updates.code)) {
      throw new ApiError(400, "Invalid department code format");
    }
  }

  if (Object.hasOwn(updates, "description")) {
    if (
      updates.description !== null &&
      typeof updates.description !== "string"
    ) {
      throw new ApiError(400, "Description must be a string");
    }

    if (typeof updates.description === "string") {
      updates.description = updates.description.trim();
    }
  }

  if (Object.hasOwn(updates, "departmentHead")) {
    if (updates.departmentHead === null || updates.departmentHead === "") {
      updates.departmentHead = undefined;
    } else {
      if (!mongoose.isValidObjectId(updates.departmentHead)) {
        throw new ApiError(400, "Invalid department head ID");
      }

      const head = await Employee.findOne({
        _id: updates.departmentHead,
        employmentStatus: "active",
      }).select("_id");

      if (!head) {
        throw new ApiError(400, "Department head must be an active employee");
      }
    }
  }

  const duplicateConditions = [];

  if (updates.name) {
    duplicateConditions.push({
      name: {
        $regex: `^${escapeRegex(updates.name)}$`,
        $options: "i",
      },
    });
  }

  if (updates.code) {
    duplicateConditions.push({ code: updates.code });
  }

  if (duplicateConditions.length > 0) {
    const duplicate = await Department.findOne({
      _id: { $ne: department._id },
      $or: duplicateConditions,
    }).select("_id");

    if (duplicate) {
      throw new ApiError(409, "Department name or code already exists");
    }
  }

  Object.assign(department, updates);
  await department.save();

  return res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});

// PATCH /api/v1/departments/:id/deactivate
export const deactivateDepartment = asyncHandler(async (req, res) => {
  requireHR(req.user);
  validateId(req.params.id);

  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (!department.isActive) {
    throw new ApiError(409, "Department is already inactive");
  }

  const assignedEmployees = await Employee.countDocuments({
    departmentId: department._id,
    employmentStatus: "active",
  });

  if (assignedEmployees > 0) {
    throw new ApiError(
      409,
      "Move active employees to another department before deactivation"
    );
  }

  department.isActive = false;
  await department.save();

  return res.status(200).json({
    success: true,
    message: "Department deactivated successfully",
    data: department,
  });
});
