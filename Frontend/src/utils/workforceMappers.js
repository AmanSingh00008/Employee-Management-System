const EMPLOYMENT_STATUS = {
  active: "Active",
  on_leave: "On Leave",
  resigned: "Inactive",
  terminated: "Inactive",
};

const EMPLOYMENT_TYPE = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

const LEAVE_STATUS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const ATTENDANCE_STATUS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  half_day: "Half Day",
  on_leave: "On Leave",
  holiday: "Holiday",
  weekend: "Weekend",
};

const ASSET_STATUS = {
  available: "Available",
  assigned: "Assigned",
  maintenance: "Maintenance",
  retired: "Retired",
  lost: "Lost",
};

const ASSET_CATEGORY = {
  laptop: "Laptop",
  desktop: "Desktop",
  monitor: "Monitor",
  keyboard: "Keyboard",
  mouse: "Mouse",
  phone: "Phone",
  tablet: "Tablet",
  other: "Other",
};

function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatTime(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function employeeName(employee) {
  if (!employee) return "—";
  return [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim() || "—";
}

export function mapEmployee(record) {
  const name = employeeName(record);
  return {
    id: record._id,
    name,
    email: record.workEmail || record.userId?.email || "",
    department: record.departmentId?.name || "—",
    departmentId: record.departmentId?._id || record.departmentId || "",
    designation: record.designation || "",
    status: EMPLOYMENT_STATUS[record.employmentStatus] || "Active",
    joined: formatDate(record.joiningDate),
    type: EMPLOYMENT_TYPE[record.employmentType] || "Full-time",
  };
}

export function mapLeaveRequest(record) {
  const employee = record.employeeId;
  const name = employeeName(employee);
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return {
    id: record._id,
    employee: name,
    initials,
    department: "—",
    type: record.leaveTypeId?.name || "Leave",
    from: formatDate(record.startDate),
    to: formatDate(record.endDate),
    days: record.totalDays ?? 0,
    reason: record.reason || "",
    status: LEAVE_STATUS[record.status] || record.status,
    appliedOn: formatDate(record.createdAt),
  };
}

export function mapAttendanceRecord(record) {
  const employee = record.employeeId;
  return {
    id: record._id,
    employee: employeeName(employee),
    department: "—",
    date: formatDate(record.date),
    checkIn: formatTime(record.checkIn),
    checkOut: formatTime(record.checkOut),
    status: ATTENDANCE_STATUS[record.status] || record.status,
    notes: record.notes || "",
  };
}

export function mapAsset(record) {
  return {
    id: record._id,
    name: record.name,
    category: ASSET_CATEGORY[record.category] || record.category,
    assetTag: record.assetCode,
    serialNumber: record.serialNumber || "—",
    assignedTo: record.status === "assigned" ? "Assigned" : "—",
    department: "—",
    purchaseDate: formatDate(record.purchaseDate),
    status: ASSET_STATUS[record.status] || record.status,
    condition: "Good",
    notes: record.notes || "",
  };
}
