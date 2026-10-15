
import mongoose from "mongoose";

import { Department } from "../models/department.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidObjectId = (id) =>
  mongoose.isValidObjectId(id);

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, departmentHead } = req.body;

  if (!name?.trim() || !code?.trim()) {
    throw new ApiError(
      400,
      "Department name and code are required"
    );
  }

  if (departmentHead && !isValidObjectId(departmentHead)) {
    throw new ApiError(400, "Invalid department head ID");
  }

  if (departmentHead) {
    const employee = await Employee.findById(departmentHead);

    if (!employee) {
      throw new ApiError(404, "Department head not found");
    }
  }

  const normalizedCode = code.trim().toUpperCase();

  const existingDepartment = await Department.findOne({
    code: normalizedCode,
  });

  if (existingDepartment) {
    throw new ApiError(409, "Department code already exists");
  }

  const department = await Department.create({
    name: name.trim(),
    code: normalizedCode,
    description,
    departmentHead: departmentHead || null,
    createdBy: req.user?._id || null,
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    data: department,
  });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  const filter = {};

  if (req.query.isActive !== undefined) {
    if (!["true", "false"].includes(req.query.isActive)) {
      throw new ApiError(400, "isActive must be true or false");
    }

    filter.isActive = req.query.isActive === "true";
  }

  if (req.query.search?.trim()) {
    const escapedSearch = req.query.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { code: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [departments, total] = await Promise.all([
    Department.find(filter)
      .populate("departmentHead", "firstName lastName employeeCode")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Department.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: departments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findById(id)
    .populate("departmentHead", "firstName lastName employeeCode");

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  res.status(200).json({
    success: true,
    data: department,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, description, departmentHead, isActive } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const allowedFields = [
    "name",
    "code",
    "description",
    "departmentHead",
    "isActive",
  ];

  const hasAllowedField = allowedFields.some((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field)
  );

  if (!hasAllowedField) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const update = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Department name cannot be empty");
    }

    update.name = name.trim();
  }

  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) {
      throw new ApiError(400, "Department code cannot be empty");
    }

    update.code = code.trim().toUpperCase();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new ApiError(400, "Description must be a string");
    }

    update.description = description.trim();
  }

  if (departmentHead !== undefined) {
    if (departmentHead === null || departmentHead === "") {
      update.departmentHead = null;
    } else {
      if (!isValidObjectId(departmentHead)) {
        throw new ApiError(400, "Invalid department head ID");
      }

      const employee = await Employee.findById(departmentHead);

      if (!employee) {
        throw new ApiError(404, "Department head not found");
      }

      update.departmentHead = departmentHead;
    }
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }

    update.isActive = isActive;
  }

  const department = await Department.findByIdAndUpdate(
    id,
    { $set: update },
    {
      new: true,
      runValidators: true,
    }
  ).populate("departmentHead", "firstName lastName employeeCode");

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: department,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const employeeExists = await Employee.exists({
    departmentId: id,
  });

  if (employeeExists) {
    throw new ApiError(
      409,
      "Department has employees. Reassign them before deactivation."
    );
  }

  department.isActive = false;
  await department.save();

  res.status(200).json({
    success: true,
    message: "Department deactivated successfully",
  });
});
