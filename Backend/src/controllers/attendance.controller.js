import { Attendance } from "../models/attendance.model.js";
import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const {
    employeeId,
    date,
    checkIn,
    checkOut,
    status,
    notes,
  } = req.body;

  const targetEmployeeId = employeeId ||
    (await Employee.findOne({ userId: req.user._id }))?._id;

  if (!targetEmployeeId || !date) {
    throw new ApiError(400, "Employee and date are required");
  }

  const employee = await Employee.findById(targetEmployeeId);

  if (!employee) throw new ApiError(404, "Employee not found");

  const attendanceDate = new Date(date);

  if (Number.isNaN(attendanceDate.getTime())) {
    throw new ApiError(400, "Invalid attendance date");
  }

  const day = new Date(attendanceDate);
  day.setUTCHours(0, 0, 0, 0);

  const nextDay = new Date(day);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  let totalMinutes = 0;

  if (checkIn && checkOut) {
    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);

    if (
      Number.isNaN(inTime.getTime()) ||
      Number.isNaN(outTime.getTime()) ||
      outTime <= inTime
    ) {
      throw new ApiError(400, "Invalid check-in or check-out time");
    }

    totalMinutes = Math.floor((outTime - inTime) / 60000);
  }

  const attendance = await Attendance.findOneAndUpdate(
    { employeeId: employee._id, date: day },
    {
      $set: {
        ...(checkIn !== undefined && { checkIn }),
        ...(checkOut !== undefined && { checkOut }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        totalMinutes,
        markedBy: req.user._id,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Attendance saved successfully",
    data: attendance,
  });
});

export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.employeeId) filter.employeeId = req.query.employeeId;
  if (req.query.status) filter.status = req.query.status;

  if (req.query.from || req.query.to) {
    filter.date = {};

    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const records = await Attendance.find(filter)
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("markedBy", "name email")
    .sort({ date: -1 });

  res.status(200).json({ success: true, data: records });
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id)
    .populate("employeeId", "employeeCode firstName lastName")
    .populate("markedBy", "name email");

  if (!record) throw new ApiError(404, "Attendance record not found");

  res.status(200).json({ success: true, data: record });
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const allowedFields = [
    "checkIn",
    "checkOut",
    "status",
    "notes",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const existing = await Attendance.findById(req.params.id);

  if (!existing) throw new ApiError(404, "Attendance record not found");

  const checkIn = updates.checkIn ?? existing.checkIn;
  const checkOut = updates.checkOut ?? existing.checkOut;

  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (Number.isNaN(start.getTime()) || end <= start) {
      throw new ApiError(400, "Invalid check-in/check-out time");
    }

    updates.totalMinutes = Math.floor((end - start) / 60000);
  }

  updates.markedBy = req.user._id;

  const record = await Attendance.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Attendance updated",
    data: record,
  });
});