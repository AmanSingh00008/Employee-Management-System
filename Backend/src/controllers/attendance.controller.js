
import mongoose from "mongoose";
import { Attendance } from "../models/attendance.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

const getManagerProfile = async (userId) => {
  const employee = await Employee.findOne({ userId }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Manager employee profile not found");
  }

  return employee;
};

const ensureEmployeeAccess = async (employeeId, user) => {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new ApiError(400, "Invalid employee ID");
  }

  const employee = await Employee.findById(employeeId).select(
    "_id managerId employmentStatus"
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // HR and Super Admin can access all employees.
  if (HR_ROLES.includes(user.role)) {
    return employee;
  }

  // Managers can access only their direct reports.
  if (user.role === "manager") {
    const manager = await getManagerProfile(user._id);

    if (String(employee.managerId) !== String(manager._id)) {
      throw new ApiError(
        403,
        "You can access attendance only for your direct reports"
      );
    }

    return employee;
  }

  throw new ApiError(403, "You do not have permission to manage attendance");
};

const parseDateOnly = (value) => {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, "Date must use YYYY-MM-DD format");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new ApiError(400, "Invalid date");
  }

  return date;
};

// POST /api/v1/attendance
// HR/Admin or manager marks attendance for an authorized employee.
export const markAttendance = asyncHandler(async (req, res) => {
  if (!HR_ROLES.includes(req.user.role) && req.user.role !== "manager") {
    throw new ApiError(
      403,
      "Only HR, Super Admin or managers can mark attendance"
    );
  }

  const {
    employeeId,
    date,
    checkIn,
    checkOut,
    status = "present",
    notes,
  } = req.body;

  if (!employeeId || !date) {
    throw new ApiError(400, "Employee ID and date are required");
  }

  const employee = await ensureEmployeeAccess(employeeId, req.user);
  const attendanceDate = parseDateOnly(date);

  const allowedStatuses = [
    "present",
    "absent",
    "late",
    "half_day",
    "on_leave",
    "holiday",
    "weekend",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid attendance status");
  }

  const parseTimestamp = (value, fieldName) => {
    if (value == null || value === "") return undefined;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new ApiError(400, `Invalid ${fieldName}`);
    }

    if (
      parsed.toISOString().slice(0, 10) !==
      attendanceDate.toISOString().slice(0, 10)
    ) {
      throw new ApiError(
        400,
        `${fieldName} must fall on the attendance date`
      );
    }

    return parsed;
  };

  const parsedCheckIn = parseTimestamp(checkIn, "check-in time");
  const parsedCheckOut = parseTimestamp(checkOut, "check-out time");

  if (
    parsedCheckIn &&
    parsedCheckOut &&
    parsedCheckOut <= parsedCheckIn
  ) {
    throw new ApiError(400, "Check-out must be after check-in");
  }

  // Do not overwrite an existing record accidentally.
  const existing = await Attendance.findOne({
    employeeId: employee._id,
    date: attendanceDate,
  }).select("_id");

  if (existing) {
    throw new ApiError(
      409,
      "Attendance already exists for this employee and date"
    );
  }

  const totalMinutes =
    parsedCheckIn && parsedCheckOut
      ? Math.floor((parsedCheckOut - parsedCheckIn) / 60000)
      : undefined;

  const attendance = await Attendance.create({
    employeeId: employee._id,
    date: attendanceDate,
    checkIn: parsedCheckIn,
    checkOut: parsedCheckOut,
    totalMinutes,
    status,
    notes: notes?.trim(),
    markedBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    data: attendance,
  });
});

// GET /api/v1/attendance
// HR sees all; managers see direct reports; employees get forbidden.
export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const {
    employeeId,
    date,
    startDate,
    endDate,
    status,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (HR_ROLES.includes(req.user.role)) {
    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID");
      }

      filter.employeeId = employeeId;
    }
  } else if (req.user.role === "manager") {
    const manager = await getManagerProfile(req.user._id);

    const teamIds = await Employee.find({
      managerId: manager._id,
    }).distinct("_id");

    const allowedIds = [manager._id, ...teamIds];

    if (employeeId) {
      if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID");
      }

      if (!allowedIds.some((id) => String(id) === String(employeeId))) {
        throw new ApiError(403, "Employee is outside your team");
      }

      filter.employeeId = employeeId;
    } else {
      filter.employeeId = { $in: teamIds };
    }
  } else {
    throw new ApiError(403, "You cannot access attendance records");
  }

  if (date) {
    filter.date = parseDateOnly(date);
  } else if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte = parseDateOnly(startDate);
    }

    if (endDate) {
      filter.date.$lte = parseDateOnly(endDate);
    }

    if (
      startDate &&
      endDate &&
      filter.date.$gte > filter.date.$lte
    ) {
      throw new ApiError(400, "Start date must not exceed end date");
    }
  }

  if (status) {
    const allowedStatuses = [
      "present",
      "absent",
      "late",
      "half_day",
      "on_leave",
      "holiday",
      "weekend",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, "Invalid attendance status");
    }

    filter.status = status;
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employeeId", "firstName lastName employeeCode")
      .populate("markedBy", "name email")
      .sort({ date: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Attendance.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: records,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// GET /api/v1/attendance/:id
export const getAttendanceById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid attendance ID");
  }

  const record = await Attendance.findById(req.params.id)
    .populate("employeeId", "firstName lastName employeeCode managerId")
    .populate("markedBy", "name email");

  if (!record) {
    throw new ApiError(404, "Attendance record not found");
  }

  await ensureEmployeeAccess(record.employeeId._id, req.user);

  return res.status(200).json({
    success: true,
    data: record,
  });
});

// PATCH /api/v1/attendance/:id
export const updateAttendance = asyncHandler(async (req, res) => {
  if (!HR_ROLES.includes(req.user.role) && req.user.role !== "manager") {
    throw new ApiError(403, "You cannot update attendance");
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, "Invalid attendance ID");
  }

  const record = await Attendance.findById(req.params.id);

  if (!record) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Always authorize against the employee linked to the record.
  await ensureEmployeeAccess(record.employeeId, req.user);

  const allowedFields = ["checkIn", "checkOut", "status", "notes"];
  const updates = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid attendance fields provided");
  }

  if (
    updates.status &&
    ![
      "present",
      "absent",
      "late",
      "half_day",
      "on_leave",
      "holiday",
      "weekend",
    ].includes(updates.status)
  ) {
    throw new ApiError(400, "Invalid attendance status");
  }

  const parseOptionalTime = (value, field) => {
    if (value === null || value === "") return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new ApiError(400, `Invalid ${field}`);
    }

    if (
      parsed.toISOString().slice(0, 10) !==
      record.date.toISOString().slice(0, 10)
    ) {
      throw new ApiError(400, `${field} must fall on the attendance date`);
    }

    return parsed;
  };

  if (Object.hasOwn(updates, "checkIn")) {
    updates.checkIn = parseOptionalTime(updates.checkIn, "check-in time");
  }

  if (Object.hasOwn(updates, "checkOut")) {
    updates.checkOut = parseOptionalTime(updates.checkOut, "check-out time");
  }

  const finalCheckIn = Object.hasOwn(updates, "checkIn")
    ? updates.checkIn
    : record.checkIn;

  const finalCheckOut = Object.hasOwn(updates, "checkOut")
    ? updates.checkOut
    : record.checkOut;

  if (
    finalCheckIn &&
    finalCheckOut &&
    finalCheckOut <= finalCheckIn
  ) {
    throw new ApiError(400, "Check-out must be after check-in");
  }

  if (Object.hasOwn(updates, "notes")) {
    updates.notes = updates.notes?.trim();
  }

  record.set(updates);

  record.totalMinutes =
    finalCheckIn && finalCheckOut
      ? Math.floor((finalCheckOut - finalCheckIn) / 60000)
      : undefined;

  record.markedBy = req.user._id;

  await record.save();

  return res.status(200).json({
    success: true,
    message: "Attendance updated successfully",
    data: record,
  });
});
