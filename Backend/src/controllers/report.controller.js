
import { Employee } from "../models/employee.model.js";
import { Department } from "../models/department.model.js";
import { Attendance } from "../models/attendance.model.js";
import { LeaveRequest } from "../models/leaveRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { Report } from "../models/report.model.js";;

const HR_ROLES = ["super_admin", "hr_admin"];

const getReportScope = async (user) => {
  if (HR_ROLES.includes(user.role)) {
    return { type: "company", employeeIds: null };
  }

  if (user.role !== "manager") {
    throw new ApiError(403, "You are not allowed to access these reports");
  }

  const manager = await Employee.findOne({
    userId: user._id,
    employmentStatus: "active",
  }).select("_id");

  if (!manager) {
    throw new ApiError(404, "Manager employee profile not found");
  }

  const reports = await Employee.find({
    managerId: manager._id,
  }).select("_id");

  return {
    type: "team",
    employeeIds: reports.map((employee) => employee._id),
  };
};

const escapeCsv = (value) => {
  const text = value == null ? "" : String(value);

  // Prevent spreadsheet formula injection.
  const safeText = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replace(/"/g, '""')}"`;
};


const sendCsv = async (
  res,
  filename,
  headers,
  rows,
  { userId, reportType, filters = {} }
) => {
  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\r\n");

  // Record the export in MongoDB before sending the file.
  await Report.create({
    generatedBy: userId,
    reportType,
    format: "csv",
    filters,
    recordCount: rows.length,
    status: "completed",
    fileName: filename,
    completedAt: new Date(),
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  return res.status(200).send("\uFEFF" + csv);
};


// GET /api/v1/reports/employees
export const exportEmployeeReport = asyncHandler(async (req, res) => {
  const scope = await getReportScope(req.user);
  const { departmentId, employmentStatus } = req.query;

  const filter = {};

  if (scope.employeeIds !== null) {
    filter._id = { $in: scope.employeeIds };
  }

  if (departmentId) {
    filter.departmentId = departmentId;
  }

  if (employmentStatus) {
    filter.employmentStatus = employmentStatus;
  }

  const employees = await Employee.find(filter)
    .populate("departmentId", "name code")
    .populate("managerId", "firstName lastName")
    .sort({ employeeCode: 1 })
    .lean();

  const headers = [
    "Employee Code",
    "First Name",
    "Last Name",
    "Work Email",
    "Designation",
    "Department",
    "Manager",
    "Employment Status",
    "Employment Type",
    "Joining Date",
  ];

  const rows = employees.map((employee) => [
    employee.employeeCode,
    employee.firstName,
    employee.lastName,
    employee.workEmail,
    employee.designation,
    employee.departmentId?.name,
    employee.managerId
      ? `${employee.managerId.firstName} ${employee.managerId.lastName}`
      : "",
    employee.employmentStatus,
    employee.employmentType,
    employee.joiningDate
      ? new Date(employee.joiningDate).toISOString().slice(0, 10)
      : "",
  ]);

  return sendCsv(
    res,
    "workforcehub-employees.csv",
    headers,
    rows
  );
});

// GET /api/v1/reports/attendance
export const exportAttendanceReport = asyncHandler(async (req, res) => {
  const scope = await getReportScope(req.user);
  const { startDate, endDate, status, employeeId } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "startDate and endDate are required");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    startDate.length !== 10 ||
    endDate.length !== 10 ||
    startDate > endDate
  ) {
    throw new ApiError(
      400,
      "Provide valid dates in YYYY-MM-DD format"
    );
  }

  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;

  if (end.getTime() - start.getTime() > maxRangeMs) {
    throw new ApiError(400, "Date range cannot exceed 366 days");
  }

  // Attendance dates are stored as dates; use a half-open UTC range.
  const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
  const rangeEnd = new Date(`${endDate}T00:00:00.000Z`);
  rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

  const filter = {
    date: { $gte: rangeStart, $lt: rangeEnd },
  };

  if (scope.employeeIds !== null) {
    filter.employeeId = { $in: scope.employeeIds };
  }

  if (employeeId) {
    if (scope.employeeIds === null) {
      filter.employeeId = employeeId;
    } else {
      const permitted = scope.employeeIds.some(
        (id) => String(id) === employeeId
      );

      if (!permitted) {
        throw new ApiError(
          403,
          "You can only export attendance for your team"
        );
      }

      filter.employeeId = employeeId;
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

  const records = await Attendance.find(filter)
    .populate(
      "employeeId",
      "employeeCode firstName lastName workEmail"
    )
    .sort({ date: 1 })
    .lean();

  const headers = [
    "Employee Code",
    "Employee Name",
    "Work Email",
    "Date",
    "Check In",
    "Check Out",
    "Total Minutes",
    "Status",
  ];

  const rows = records.map((record) => {
    const employee = record.employeeId;

    return [
      employee?.employeeCode,
      employee
        ? `${employee.firstName} ${employee.lastName}`
        : "",
      employee?.workEmail,
      record.date
        ? new Date(record.date).toISOString().slice(0, 10)
        : "",
      record.checkIn
        ? new Date(record.checkIn).toISOString()
        : "",
      record.checkOut
        ? new Date(record.checkOut).toISOString()
        : "",
      record.totalMinutes,
      record.status,
    ];
  });

  return sendCsv(
    res,
    "workforcehub-attendance.csv",
    headers,
    rows
  );
});

// GET /api/v1/reports/leave-requests
export const exportLeaveReport = asyncHandler(async (req, res) => {
  const scope = await getReportScope(req.user);
  const { startDate, endDate, status } = req.query;

  const filter = {};

  if (scope.employeeIds !== null) {
    filter.employeeId = { $in: scope.employeeIds };
  }

  if (startDate || endDate) {
    filter.startDate = {};

    if (startDate) {
      const date = new Date(`${startDate}T00:00:00.000Z`);

      if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid startDate");
      }

      filter.startDate.$gte = date;
    }

    if (endDate) {
      const date = new Date(`${endDate}T00:00:00.000Z`);

      if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid endDate");
      }

      date.setUTCDate(date.getUTCDate() + 1);
      filter.startDate.$lt = date;
    }
  }

  if (status) {
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, "Invalid leave status");
    }

    filter.status = status;
  }

  const requests = await LeaveRequest.find(filter)
    .populate(
      "employeeId",
      "employeeCode firstName lastName workEmail"
    )
    .populate("leaveTypeId", "name code")
    .sort({ startDate: -1 })
    .lean();

  const headers = [
    "Employee Code",
    "Employee Name",
    "Leave Type",
    "Start Date",
    "End Date",
    "Total Days",
    "Status",
    "Reason",
  ];

  const rows = requests.map((request) => [
    request.employeeId?.employeeCode,
    request.employeeId
      ? `${request.employeeId.firstName} ${request.employeeId.lastName}`
      : "",
    request.leaveTypeId?.name,
    request.startDate
      ? new Date(request.startDate).toISOString().slice(0, 10)
      : "",
    request.endDate
      ? new Date(request.endDate).toISOString().slice(0, 10)
      : "",
    request.totalDays,
    request.status,
    request.reason,
  ]);

  return sendCsv(
    res,
    "workforcehub-leave-requests.csv",
    headers,
    rows
  );
});
