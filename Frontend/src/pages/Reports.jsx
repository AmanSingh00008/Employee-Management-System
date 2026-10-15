
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  CalendarDays,
  ChartColumnIncreasing,
  CheckCircle2,
  Clock,
  Download,
  FileBarChart,
  FileText,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock report data — replace with API data when the backend is ready.
const monthlyAttendance = [
  { month: "Jan", present: 92, absent: 5, late: 3 },
  { month: "Feb", present: 94, absent: 3, late: 3 },
  { month: "Mar", present: 91, absent: 6, late: 3 },
  { month: "Apr", present: 95, absent: 3, late: 2 },
  { month: "May", present: 93, absent: 4, late: 3 },
  { month: "Jun", present: 96, absent: 2, late: 2 },
  { month: "Jul", present: 94, absent: 4, late: 2 },
  { month: "Aug", present: 95, absent: 3, late: 2 },
  { month: "Sep", present: 92, absent: 5, late: 3 },
  { month: "Oct", present: 96, absent: 2, late: 2 },
  { month: "Nov", present: 94, absent: 3, late: 3 },
  { month: "Dec", present: 97, absent: 2, late: 1 },
];

const departmentData = [
  { name: "Engineering", employees: 68 },
  { name: "Marketing", employees: 32 },
  { name: "Sales", employees: 45 },
  { name: "HR", employees: 18 },
  { name: "Finance", employees: 25 },
  { name: "Design", employees: 22 },
  { name: "Operations", employees: 38 },
];

const leaveTrends = [
  { month: "Jan", approved: 24, rejected: 4, pending: 5 },
  { month: "Feb", approved: 31, rejected: 3, pending: 6 },
  { month: "Mar", approved: 27, rejected: 5, pending: 4 },
  { month: "Apr", approved: 35, rejected: 4, pending: 7 },
  { month: "May", approved: 29, rejected: 2, pending: 5 },
  { month: "Jun", approved: 38, rejected: 3, pending: 4 },
];

const assetData = [
  { name: "Assigned", value: 184, color: "#4f46e5" },
  { name: "Available", value: 42, color: "#10b981" },
  { name: "Maintenance", value: 15, color: "#f59e0b" },
  { name: "Retired", value: 9, color: "#94a3b8" },
];

const reportTypes = [
  { value: "overview", label: "Overview Report" },
  { value: "attendance", label: "Attendance Report" },
  { value: "departments", label: "Department Report" },
  { value: "leaves", label: "Leave Report" },
  { value: "assets", label: "Asset Report" },
];

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Reports() {
  const [period, setPeriod] = useState("year");
  const [reportType, setReportType] = useState("overview");

  const attendanceData = useMemo(() => {
    if (period === "quarter") return monthlyAttendance.slice(9, 12);
    if (period === "half") return monthlyAttendance.slice(6, 12);
    return monthlyAttendance;
  }, [period]);

  const totalEmployees = departmentData.reduce(
    (sum, department) => sum + department.employees,
    0
  );

  const averageAttendance = Math.round(
    attendanceData.reduce((sum, month) => sum + month.present, 0) /
      attendanceData.length
  );

  const exportReport = () => {
    const date = new Date().toISOString().slice(0, 10);

    if (reportType === "attendance") {
      downloadCSV(
        `attendance-report-${date}.csv`,
        attendanceData.map((item) => ({
          Month: item.month,
          "Present (%)": item.present,
          "Absent (%)": item.absent,
          "Late (%)": item.late,
        }))
      );
      return;
    }

    if (reportType === "departments") {
      downloadCSV(
        `department-report-${date}.csv`,
        departmentData.map((item) => ({
          Department: item.name,
          Employees: item.employees,
          "Share (%)": ((item.employees / totalEmployees) * 100).toFixed(1),
        }))
      );
      return;
    }

    if (reportType === "leaves") {
      downloadCSV(
        `leave-report-${date}.csv`,
        leaveTrends.map((item) => ({
          Month: item.month,
          Approved: item.approved,
          Rejected: item.rejected,
          Pending: item.pending,
        }))
      );
      return;
    }

    if (reportType === "assets") {
      downloadCSV(
        `asset-report-${date}.csv`,
        assetData.map((item) => ({
          Status: item.name,
          "Asset Count": item.value,
        }))
      );
      return;
    }

    downloadCSV(`workforcehub-overview-${date}.csv`, [
      {
        Report: "WorkforceHub Overview",
        "Total Employees": totalEmployees,
        "Average Attendance (%)": averageAttendance,
        "Pending Leave Requests": 17,
        "Assigned Assets": 184,
      },
    ]);
  };

  const showAttendance =
    reportType === "overview" || reportType === "attendance";
  const showDepartments =
    reportType === "overview" || reportType === "departments";
  const showLeaves = reportType === "overview" || reportType === "leaves";
  const showAssets = reportType === "overview" || reportType === "assets";

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileBarChart size={17} />
            <span>WorkforceHub / Reports</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Analyze workforce performance and generate reports.
          </p>
        </div>

        <button
          type="button"
          onClick={exportReport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="reportType"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Report type
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="reportPeriod"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Attendance chart period
          </label>
          <select
            id="reportPeriod"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="quarter">Last quarter (Oct–Dec)</option>
            <option value="half">Last 6 months (Jul–Dec)</option>
            <option value="year">Full year</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <CalendarDays size={17} className="text-indigo-600" />
          <span>Reporting year: {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Summary cards */}
      {reportType === "overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            subtitle="Across all departments"
            icon={Users}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Average Attendance"
            value={`${averageAttendance}%`}
            subtitle="For the selected period"
            icon={Activity}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Pending Leaves"
            value="17"
            subtitle="Awaiting approval"
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Assigned Assets"
            value="184"
            subtitle="Currently assigned"
            icon={CheckCircle2}
            color="bg-sky-50 text-sky-600"
          />
        </div>
      )}

      {/* Attendance chart */}
      {showAttendance && (
        <ChartCard
          title="Attendance Overview"
          subtitle="Monthly employee attendance percentage"
          action={
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {averageAttendance}% average
            </span>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Legend />
                <Bar
                  dataKey="present"
                  name="Present"
                  fill="#4f46e5"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="#f87171"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="late"
                  name="Late"
                  fill="#fbbf24"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Note: Percentages are sample data for the frontend preview.
          </p>
        </ChartCard>
      )}

      {/* Department and assets charts */}
      {(showDepartments || showAssets) && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {showDepartments && (
            <ChartCard
              title="Employees by Department"
              subtitle="Workforce distribution across departments"
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    layout="vertical"
                    margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="employees"
                      name="Employees"
                      fill="#6366f1"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Total workforce</span>
                <span className="font-semibold text-slate-900">
                  {totalEmployees} employees
                </span>
              </div>
            </ChartCard>
          )}

          {showAssets && (
            <ChartCard
              title="Asset Distribution"
              subtitle="Equipment grouped by current status"
            >
              <div className="relative h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {assetData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">
                    {assetData.reduce((sum, item) => sum + item.value, 0)}
                  </span>
                  <span className="text-xs text-slate-500">Total assets</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {assetData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600">{item.name}</span>
                    <span className="ml-auto text-sm font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {/* Leave trends */}
      {showLeaves && (
        <ChartCard
          title="Leave Request Trends"
          subtitle="Monthly approved, rejected and pending requests"
          action={
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
              <ChartColumnIncreasing size={14} />
              Last 6 months
            </span>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={leaveTrends}
                margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Report table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Report Summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              Key metrics from your selected report.
            </p>
          </div>
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowDownToLine size={16} />
            Download data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Metric</th>
                <th className="px-5 py-4 font-semibold">Value</th>
                <th className="px-5 py-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  metric: "Total employees",
                  value: totalEmployees,
                  description: "Employees across all departments",
                },
                {
                  metric: "Average attendance",
                  value: `${averageAttendance}%`,
                  description: "Average for the selected period",
                },
                {
                  metric: "Pending leave requests",
                  value: 17,
                  description: "Requests waiting for approval",
                },
                {
                  metric: "Assigned assets",
                  value: 184,
                  description: "Equipment assigned to employees",
                },
              ].map((row) => (
                <tr
                  key={row.metric}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-800">
                    {row.metric}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {row.value}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50/70 p-4">
          <FileText
            size={18}
            className="mt-0.5 shrink-0 text-indigo-600"
          />
          <p className="text-xs leading-5 text-slate-500">
            These reports use demonstration data. Metrics and exported CSV
            files will reflect real employee records after backend integration.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Reports;
