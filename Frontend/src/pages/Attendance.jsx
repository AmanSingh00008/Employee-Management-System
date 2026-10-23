
import { useEffect, useMemo, useState } from "react";
import { fetchAttendanceRecords, createAttendance, updateAttendance, fetchEmployees } from "../services/workforceApi.js";
import { mapAttendanceRecord } from "../utils/workforceMappers.js";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Eye,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  UserCheck,
  Timer,
} from "lucide-react";

const today = new Date().toLocaleDateString("en-CA");

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Design",
  "Operations",
];

const statuses = ["Present", "Absent", "Late", "On Leave"];

const emptyForm = {
  employeeId: "",
  date: today,
  checkIn: "",
  checkOut: "",
  status: "Present",
  notes: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    Present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Absent: "bg-rose-50 text-rose-700 ring-rose-200",
    Late: "bg-amber-50 text-amber-700 ring-amber-200",
    "On Leave": "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AttendanceModal({ attendance, onClose, onSave, employees }) {
  const [form, setForm] = useState(() => {
    if (attendance) {
      return {
        ...attendance,
        employeeId: attendance.employeeId?._id || attendance.employeeId || "",
      };
    }
    return { ...emptyForm };
  });
  const [error, setError] = useState("");

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      form.checkIn &&
      form.checkOut &&
      form.checkOut <= form.checkIn
    ) {
      setError("Check-out time must be later than check-in time.");
      return;
    }

    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {attendance ? "Edit Attendance" : "Mark Attendance"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the employee's attendance details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Employee *
            </label>
            <select
              required
              value={form.employeeId || ""}
              onChange={(event) =>
                updateField("employeeId", event.target.value)
              }
              className={inputClass}
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.employeeCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Attendance date *
            </label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Check-in time
              </label>
              <input
                type="time"
                value={form.checkIn}
                onChange={(event) =>
                  updateField("checkIn", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Check-out time
              </label>
              <input
                type="time"
                value={form.checkOut}
                onChange={(event) =>
                  updateField("checkOut", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Attendance status
            </label>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className={inputClass}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Add a note..."
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AttendanceDetails({ record, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Attendance Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Employee attendance record
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {record.employee}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {record.department}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge status={record.status} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-semibold text-gray-800">
              {formatDate(record.date)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <Clock3 size={18} className="text-emerald-600" />
              <p className="mt-3 text-xs text-gray-500">Check-in</p>
              <p className="mt-1 font-semibold text-gray-900">
                {record.checkIn || "Not recorded"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <Clock3 size={18} className="text-rose-600" />
              <p className="mt-3 text-xs text-gray-500">Check-out</p>
              <p className="mt-1 font-semibold text-gray-900">
                {record.checkOut || "Not recorded"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Notes</p>
            <p className="mt-2 rounded-xl border border-gray-100 p-3 text-sm text-gray-600">
              {record.notes || "No notes added."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function toTimeInput(value) {
  if (!value) return "";

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return value;

  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function toDisplayTime(value) {
  if (!value) return "";

  const [hours, minutes] = value.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [rows, empList] = await Promise.all([
          fetchAttendanceRecords(),
          fetchEmployees(),
        ]);
        if (!cancelled) {
          setRecords(rows.map(mapAttendanceRecord));
          setEmployees(empList);
        }
      } catch (err) {
        if (!cancelled) {
          setRecords([]);
          setLoadError(
            err.response?.data?.message || "Could not load attendance from the server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dateRecords = useMemo(
    () => records.filter((record) => record.date === selectedDate),
    [records, selectedDate]
  );

  const summary = useMemo(
    () => ({
      total: dateRecords.length,
      present: dateRecords.filter((record) => record.status === "Present").length,
      absent: dateRecords.filter((record) => record.status === "Absent").length,
      late: dateRecords.filter((record) => record.status === "Late").length,
      onLeave: dateRecords.filter((record) => record.status === "On Leave").length,
    }),
    [dateRecords]
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dateRecords.filter((record) => {
      const matchesSearch =
        record.employee.toLowerCase().includes(query) ||
        record.department.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        record.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [dateRecords, search, statusFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const visibleRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function changeFilter(setter, value) {
    setter(value);
    setCurrentPage(1);
  }

  function openAddModal() {
    setEditingRecord(null);
    setShowModal(true);
  }

  function openEditModal(record) {
    setEditingRecord({
      ...record,
      employeeId: record.employeeId?._id || record.employeeId,
      checkIn: toTimeInput(record.checkIn),
      checkOut: toTimeInput(record.checkOut),
    });
    setShowModal(true);
  }

  async function saveAttendance(form) {
    try {
      const statusMap = {
        "Present": "present",
        "Absent": "absent",
        "Late": "late",
        "On Leave": "on_leave",
      };

      const employee = employees.find((emp) => emp._id === form.employeeId);
      if (!employee) {
        alert("Please select a valid employee.");
        return;
      }

      const attendanceData = {
        employeeId: form.employeeId,
        date: form.date,
        checkIn: form.checkIn ? `${form.date}T${form.checkIn}:00.000Z` : null,
        checkOut: form.checkOut ? `${form.date}T${form.checkOut}:00.000Z` : null,
        status: statusMap[form.status] || "present",
        notes: form.notes,
      };

      if (editingRecord) {
        const updated = await updateAttendance(editingRecord.id, attendanceData);
        setRecords((previous) =>
          previous.map((record) =>
            record.id === editingRecord.id ? mapAttendanceRecord(updated) : record
          )
        );
      } else {
        const created = await createAttendance(attendanceData);
        setRecords((previous) => [mapAttendanceRecord(created), ...previous]);
      }

      setSelectedDate(form.date);
      setCurrentPage(1);
      setSearch("");
      setStatusFilter("All");
      setDepartmentFilter("All");
      setShowModal(false);
      setEditingRecord(null);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      alert(err.response?.data?.message || "Failed to save attendance record.");
    }
  }

  function exportCSV() {
    const headers = [
      "Employee",
      "Department",
      "Date",
      "Check In",
      "Check Out",
      "Status",
      "Notes",
    ];

    const rows = filteredRecords.map((record) => [
      record.employee,
      record.department,
      record.date,
      record.checkIn,
      record.checkOut,
      record.status,
      record.notes,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {loadError && (
          <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
          </div>
        )}

        {loading && !loadError && (
          <p className="text-sm text-gray-500">Loading attendance from the server…</p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>WorkforceHub</span>
              <span>/</span>
              <span className="text-gray-800">Attendance</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Attendance Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Track employee attendance, working hours and daily records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download size={17} />
              Export CSV
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Mark Attendance
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Attendance date</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a date to view its records.
              </p>
            </div>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Records"
            value={summary.total}
            subtitle="Employees with records"
            icon={UserCheck}
            color="blue"
          />
          <SummaryCard
            title="Present"
            value={summary.present}
            subtitle="Marked present"
            icon={CheckCircle2}
            color="green"
          />
          <SummaryCard
            title="Absent"
            value={summary.absent}
            subtitle="Marked absent"
            icon={XCircle}
            color="red"
          />
          <SummaryCard
            title="Late Arrivals"
            value={summary.late}
            subtitle="Arrived after schedule"
            icon={Timer}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Attendance rate
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.total
                    ? `${Math.round(
                        ((summary.present + summary.late) / summary.total) *
                          100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${
                    summary.total
                      ? ((summary.present + summary.late) / summary.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Present and late records combined for the selected date.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">On Leave</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {summary.onLeave}
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <CalendarDays size={22} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Approved leave records for {formatDate(selectedDate)}.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Daily Attendance Records
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and update attendance for {formatDate(selectedDate)}.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:w-60">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search employee..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={departmentFilter}
                  onChange={(event) =>
                    changeFilter(setDepartmentFilter, event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-48"
                >
                  <option value="All">All departments</option>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    changeFilter(setStatusFilter, event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-40"
                >
                  <option value="All">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Check-in</th>
                  <th className="px-6 py-4">Check-out</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleRecords.map((record) => {
                  const initials = record.employee
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={record.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {record.employee}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {record.department}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <Clock3 size={15} className="text-emerald-600" />
                          {record.checkIn || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <Clock3 size={15} className="text-rose-500" />
                          {record.checkOut || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>

                      <td className="max-w-40 px-6 py-4 text-sm text-gray-500">
                        <span className="block truncate">
                          {record.notes || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View details"
                            onClick={() => setSelectedRecord(record)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Edit attendance"
                            onClick={() => openEditModal(record)}
                            className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {visibleRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <AlertCircle size={22} />
                      </div>
                      <p className="mt-3 font-semibold text-gray-800">
                        No attendance records found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try another date or change the filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {filteredRecords.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}
              {"–"}
              {Math.min(safePage * pageSize, filteredRecords.length)} of{" "}
              {filteredRecords.length} records
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-20 text-center text-sm font-medium text-gray-700">
                Page {safePage} of {totalPages}
              </span>

              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-blue-600">
              <Clock3 size={19} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Attendance reminder
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Review missing check-in and check-out times regularly.
                Attendance records should reflect the employee's actual working
                hours and approved leave.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AttendanceModal
          attendance={editingRecord}
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
          }}
          onSave={saveAttendance}
          employees={employees}
        />
      )}

      {selectedRecord && (
        <AttendanceDetails
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
