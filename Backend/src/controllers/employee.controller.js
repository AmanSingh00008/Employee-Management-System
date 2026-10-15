
import mongoose from "mongoose";

import { Employee } from "../models/employee.model.js";
import { User } from "../models/user.model.js";
import { Department } from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const employeeFields = [
  "employeeCode",
  "firstName",
  "lastName",
  "workEmail",
  "phone",
  "designation",
  "departmentId",
  "managerId",
  "employmentType",
  "employmentStatus",
  "joiningDate",
  "exitDate",
  "dateOfBirth",
  "address",
];

export const validateActiveDepartment = async (departmentId) => {
  if (!departmentId) {
    throw new ApiError(400, "Department is required");
  }

  if (!mongoose.isValidObjectId(departmentId)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findOne({
    _id: departmentId,
    isActive: true,
  }).select("_id name");

  if (!department) {
    throw new ApiError(
      400,
      "Department does not exist or is inactive"
    );
  }

  return department;
};


const validateEmployeeReferences = async ({
  departmentId,
  managerId,
  userId,
  currentEmployeeId,
}) => {
  if (departmentId) {
    if (!isValidId(departmentId)) {
      throw new ApiError(400, "Invalid department ID");
    }

    const department = await Department.findOne({
      _id: departmentId,
      isActive: true,
    });

    if (!department) {
      throw new ApiError(400, "Active department not found");
    }
  }

  if (managerId) {
    if (!isValidId(managerId)) {
      throw new ApiError(400, "Invalid manager ID");
    }

    if (
      currentEmployeeId &&
      String(managerId) === String(currentEmployeeId)
    ) {
      throw new ApiError(400, "Employee cannot be their own manager");
    }

    const manager = await Employee.findOne({
      _id: managerId,
      employmentStatus: "active",
    });

    if (!manager) {
      throw new ApiError(400, "Active manager not found");
    }
  }

  if (userId) {
    if (!isValidId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findOne({
      _id: userId,
      status: "active",
    });

    if (!user) {
      throw new ApiError(400, "Active user account not found");
    }

    const existingEmployee = await Employee.findOne({
      userId,
      ...(currentEmployeeId
        ? { _id: { $ne: currentEmployeeId } }
        : {}),
    });

    if (existingEmployee) {
      throw new ApiError(
        409,
        "This user account is already linked to an employee"
      );
    }
  }
};

const populateEmployee = (query) =>
  query
    .populate("departmentId", "name code")
    .populate("managerId", "firstName lastName employeeCode")
    .populate("userId", "name email role status");

export const createEmployee = asyncHandler(async (req, res) => {
  const {
    employeeCode,
    firstName,
    lastName,
    workEmail,
    phone,
    designation,
    departmentId,
    managerId,
    userId,
    employmentType,
    employmentStatus,
    joiningDate,
    exitDate,
    dateOfBirth,
    address,
  } = req.body;

  if (
    typeof employeeCode !== "string" ||
    !employeeCode.trim() ||
    typeof firstName !== "string" ||
    !firstName.trim() ||
    !joiningDate
  ) {
    throw new ApiError(
      400,
      "Employee code, first name and joining date are required"
    );
  }

  if (employmentStatus && employmentStatus !== "active") {
    throw new ApiError(
      400,
      "New employees must start with active status"
    );
  }

  if (exitDate && new Date(exitDate) < new Date(joiningDate)) {
    throw new ApiError(400, "Exit date cannot precede joining date");
  }

  await validateEmployeeReferences({
    departmentId,
    managerId,
    userId,
  });

  const employee = await Employee.create({
    employeeCode: employeeCode.trim().toUpperCase(),
    firstName: firstName.trim(),
    lastName,
    workEmail,
    phone,
    designation,
    departmentId: departmentId || null,
    managerId: managerId || null,
    userId: userId || null,
    employmentType,
    employmentStatus: "active",
    joiningDate,
    exitDate,
    dateOfBirth,
    address,
    createdBy: req.user?._id || null,
  });

  const result = await populateEmployee(
    Employee.findById(employee._id)
  );

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: result,
  });
});

export const getEmployees = asyncHandler(async (req, res) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
  );

  const filter = {};

  if (req.query.departmentId) {
    if (!isValidId(req.query.departmentId)) {
      throw new ApiError(400, "Invalid department ID");
    }

    filter.departmentId = req.query.departmentId;
  }

  if (req.query.status) {
    const allowedStatuses = [
      "active",
      "on_leave",
      "resigned",
      "terminated",
    ];

    if (!allowedStatuses.includes(req.query.status)) {
      throw new ApiError(400, "Invalid employment status");
    }

    filter.employmentStatus = req.query.status;
  }

  if (req.query.search?.trim()) {
    const escaped = req.query.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { firstName: { $regex: escaped, $options: "i" } },
      { lastName: { $regex: escaped, $options: "i" } },
      { employeeCode: { $regex: escaped, $options: "i" } },
      { workEmail: { $regex: escaped, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    populateEmployee(Employee.find(filter))
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Employee.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const employee = await populateEmployee(
    Employee.findById(id)
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const existing = await Employee.findById(id);

  if (!existing) {
    throw new ApiError(404, "Employee not found");
  }

  const update = {};

  for (const field of employeeFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      update[field] = req.body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "No valid employee fields provided");
  }

  if (update.employeeCode !== undefined) {
    if (
      typeof update.employeeCode !== "string" ||
      !update.employeeCode.trim()
    ) {
      throw new ApiError(400, "Employee code cannot be empty");
    }

    update.employeeCode = update.employeeCode.trim().toUpperCase();
  }

  if (update.firstName !== undefined) {
    if (
      typeof update.firstName !== "string" ||
      !update.firstName.trim()
    ) {
      throw new ApiError(400, "First name cannot be empty");
    }

    update.firstName = update.firstName.trim();
  }

  if (update.departmentId) {
    await validateEmployeeReferences({
      departmentId: update.departmentId,
    });
  }

  if (update.managerId) {
    await validateEmployeeReferences({
      managerId: update.managerId,
      currentEmployeeId: id,
    });
  }

  if (update.userId) {
    await validateEmployeeReferences({
      userId: update.userId,
      currentEmployeeId: id,
    });
  }

  const joiningDate = update.joiningDate ?? existing.joiningDate;
  const exitDate = Object.hasOwn(update, "exitDate")
    ? update.exitDate
    : existing.exitDate;

  if (
    exitDate &&
    new Date(exitDate) < new Date(joiningDate)
  ) {
    throw new ApiError(400, "Exit date cannot precede joining date");
  }

  const employee = await Employee.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: await populateEmployee(
      Employee.findById(employee._id)
    ),
  });
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const employee = await Employee.findByIdAndUpdate(
    id,
    {
      $set: {
        employmentStatus: "terminated",
        exitDate: new Date(),
      },
    },
    { new: true, runValidators: true }
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  res.status(200).json({
    success: true,
    message: "Employee deactivated successfully",
  });
});
