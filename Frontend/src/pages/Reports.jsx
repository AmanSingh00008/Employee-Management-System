
import { useMemo, useState, useEffect } from "react";
import { Users, CalendarDays, FileBarChart, FileBarChart as FileBar } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { fetchEmployees, fetchLeaveRequests, fetchAttendanceRecords, fetchAssets } from "../services/workforceApi.js";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [emps, lvs, atd, asts] = await Promise.all([
          fetchEmployees(),
          fetchLeaveRequests(),
          fetchAttendanceRecords(),
          fetchAssets(),
        ]);
        if (!cancelled) {
          setEmployees(emps);
          setLeaves(lvs);
          setAttendance(atd);
          setAssets(asts);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Could not load report data from the server."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalEmployees = employees.length;
  const totalLeaves = leaves.length;

  const assetSummary = useMemo(() => {
    if (!assets || assets.length === 0) return [
      { name: "Assigned", value: 0, color: "#4f46e5" },
      { name: "Available", value: 0, color: "#10b981" },
      { name: "Maintenance", value: 0, color: "#f59e0b" },
      { name: "Retired", value: 0, color: "#94a3b8" },
    ];

    const byStatus = assets.reduce((acc, a) => {
      const s = (a.status || "").toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Assigned", value: byStatus.assigned || 0, color: "#4f46e5" },
      { name: "Available", value: byStatus.available || 0, color: "#10b981" },
      { name: "Maintenance", value: byStatus.maintenance || 0, color: "#f59e0b" },
      { name: "Retired", value: byStatus.retired || 0, color: "#94a3b8" },
    ];
  }, [assets]);

  const monthly = useMemo(() => {
    const byMonth = new Map();

    attendance.forEach((record) => {
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!byMonth.has(key)) {
        byMonth.set(key, {
          month: date.toLocaleDateString("en", {
            month: "short",
            timeZone: "UTC",
          }),
          present: 0,
          absent: 0,
          late: 0,
        });
      }

      const month = byMonth.get(key);
      if (record.status === "present") month.present += 1;
      if (record.status === "absent") month.absent += 1;
      if (record.status === "late") month.late += 1;
    });

    return [...byMonth.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-6)
      .map(([, data]) => data);
  }, [attendance]);

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileBar size={17} />
            <span>WorkforceHub / Reports</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="text-sm text-slate-500">Loading report data…</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Employees" value={totalEmployees} subtitle="Employees in the org" />
        <StatCard title="Attendance Records" value={attendance.length} subtitle="Attendance entries" />
        <StatCard title="Leave Requests" value={totalLeaves} subtitle="Leave requests" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Asset Distribution</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={assetSummary} dataKey="value" nameKey="name" innerRadius={48} outerRadius={86} paddingAngle={4}>
                  {assetSummary.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold">Monthly Attendance</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
