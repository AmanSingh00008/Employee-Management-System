
import { useEffect, useMemo, useState } from "react";
import { fetchLeaveRequests, fetchLeaveTypes, createLeaveRequest, reviewLeaveRequest } from "../services/workforceApi.js";
import { mapLeaveRequest } from "../utils/workforceMappers.js";
import {
  Plus,
  Search,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  CircleAlert,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Palmtree,
  Stethoscope,
  BriefcaseBusiness,
  Heart,
  Filter,
} from "lucide-react";

const emptyForm = {
  type: "Casual Leave",
  from: "",
  to: "",
  reason: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDays(from, to) {
  if (!from || !to || to < from) return 0;

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  return Math.round((end - start) / 86400000) + 1;
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
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
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
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

function LeaveModal({ onClose, onSave, leaveTypes }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.to < form.from) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (getDays(form.from, form.to) < 1) {
      setError("Please select a valid leave date.");
      return;
    }

    onSave(form);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
              Create Leave Request
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the employee's leave details.
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
              Leave type
            </label>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className={inputClass}
            >
              {leaveTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Start date *
              </label>
              <input
                required
                type="date"
                value={form.from}
                onChange={(event) => updateField("from", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                End date *
              </label>
              <input
                required
                type="date"
                min={form.from || undefined}
                value={form.to}
                onChange={(event) => updateField("to", event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {form.from && form.to && form.to >= form.from && (
            <p className="text-sm font-medium text-blue-700">
              Duration: {getDays(form.from, form.to)} day(s)
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Reason for leave *
            </label>
            <textarea
              required
              minLength={5}
              rows={3}
              value={form.reason}
              onChange={(event) => updateField("reason", event.target.value)}
              placeholder="Explain the reason for this leave..."
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeaveDetails({ leave, onClose, onStatusChange }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Leave Request Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Request #{leave.id}
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
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
              {leave.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900">{leave.employee}</h3>
              <p className="text-sm text-gray-500">{leave.department}</p>
            </div>
            <StatusBadge status={leave.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Leave type</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {leave.type}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {leave.days} day(s)
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">From</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatDate(leave.from)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">To</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatDate(leave.to)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">
              Reason for leave
            </p>
            <p className="mt-2 rounded-xl border border-gray-100 p-4 text-sm leading-6 text-gray-600">
              {leave.reason}
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Applied on {formatDate(leave.appliedOn)}
          </p>

          {leave.status === "Pending" && (
            <div className="flex gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => onStatusChange(leave.id, "Rejected")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                <X size={16} /> Reject
              </button>
              <button
                onClick={() => onStatusChange(leave.id, "Approved")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Check size={16} /> Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [rows, types] = await Promise.all([
          fetchLeaveRequests(),
          fetchLeaveTypes(),
        ]);
        if (!cancelled) {
          setLeaves(rows.map(mapLeaveRequest));
          setLeaveTypes(types);
        }
      } catch (err) {
        if (!cancelled) {
          setLeaves([]);
          setLoadError(
            err.response?.data?.message || "Could not load leave requests from the server."
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

  const summary = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((leave) => leave.status === "Pending").length,
      approved: leaves.filter((leave) => leave.status === "Approved").length,
      rejected: leaves.filter((leave) => leave.status === "Rejected").length,
    }),
    [leaves]
  );

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leaves.filter((leave) => {
      const matchesSearch =
        leave.employee.toLowerCase().includes(query) ||
        leave.department.toLowerCase().includes(query) ||
        leave.type.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      const matchesType = typeFilter === "All" || leave.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const visibleLeaves = filteredLeaves.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  async function updateStatus(id, status) {
    try {
      const updated = await reviewLeaveRequest(id, {
        status: status.toLowerCase(),
      });
      setLeaves((previous) =>
        previous.map((leave) =>
          leave.id === id ? mapLeaveRequest(updated) : leave
        )
      );
      setSelectedLeave((previous) =>
        previous?.id === id ? mapLeaveRequest(updated) : previous
      );
    } catch (err) {
      console.error("Failed to update leave status:", err);
    }
  }

  async function addLeave(form) {
    try {
      const leaveType = leaveTypes.find((lt) => lt.name === form.type);
      if (!leaveType) {
        alert("Leave type not found. Please contact administrator.");
        return;
      }

      const created = await createLeaveRequest({
        leaveTypeId: leaveType._id,
        startDate: form.from,
        endDate: form.to,
        reason: form.reason,
      });

      setLeaves((previous) => [mapLeaveRequest(created), ...previous]);
      setCurrentPage(1);
      setShowModal(false);
      setSearch("");
      setStatusFilter("All");
      setTypeFilter("All");
    } catch (err) {
      console.error("Failed to create leave request:", err);
      alert(err.response?.data?.message || "Failed to create leave request.");
    }
  }

  function changeFilter(setter, value) {
    setter(value);
    setCurrentPage(1);
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
          <p className="text-sm text-gray-500">Loading leave requests from the server…</p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>WorkforceHub</span>
              <span>/</span>
              <span className="text-gray-800">Leave Management</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Leave Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage employee leave requests and track their status.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            New Leave Request
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Requests"
            value={summary.total}
            subtitle="All leave applications"
            icon={CalendarDays}
            color="blue"
          />
          <SummaryCard
            title="Pending Requests"
            value={summary.pending}
            subtitle="Awaiting a decision"
            icon={Clock3}
            color="amber"
          />
          <SummaryCard
            title="Approved Requests"
            value={summary.approved}
            subtitle="Accepted applications"
            icon={CheckCircle2}
            color="green"
          />
          <SummaryCard
            title="Rejected Requests"
            value={summary.rejected}
            subtitle="Declined applications"
            icon={XCircle}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Palmtree size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Casual Leave</p>
              <p className="mt-1 text-lg font-bold text-gray-900">Personal time</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <Stethoscope size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sick Leave</p>
              <p className="mt-1 text-lg font-bold text-gray-900">Health and recovery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Earned Leave</p>
              <p className="mt-1 text-lg font-bold text-gray-900">Planned time off</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Leave Requests
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review applications and take action.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-64">
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

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      changeFilter(setStatusFilter, event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-40"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    changeFilter(setTypeFilter, event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-44"
                >
                  <option value="All">All leave types</option>
                  {leaveTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleLeaves.map((leave) => (
                  <tr key={leave.id} className="transition hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {leave.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {leave.employee}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {leave.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {leave.type}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {leave.days} day(s)
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(leave.from)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        to {formatDate(leave.to)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(leave.appliedOn)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="View details"
                          onClick={() => setSelectedLeave(leave)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                        </button>

                        {leave.status === "Pending" && (
                          <>
                            <button
                              title="Approve"
                              onClick={() => updateStatus(leave.id, "Approved")}
                              className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              title="Reject"
                              onClick={() => updateStatus(leave.id, "Rejected")}
                              className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleLeaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <CircleAlert size={22} />
                      </div>
                      <p className="mt-3 font-semibold text-gray-800">
                        No leave requests found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filter.
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
              {filteredLeaves.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}
              {"–"}
              {Math.min(safePage * pageSize, filteredLeaves.length)} of{" "}
              {filteredLeaves.length} requests
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
              <Heart size={19} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Leave management tip
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Review pending requests regularly and check team availability
                before approving overlapping leave dates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <LeaveModal
          onClose={() => setShowModal(false)}
          onSave={addLeave}
          leaveTypes={leaveTypes.map((lt) => lt.name)}
        />
      )}

      {selectedLeave && (
        <LeaveDetails
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
