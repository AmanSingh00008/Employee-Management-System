
import { useMemo, useState, useEffect } from "react";
import { Users, CalendarDays, FileBarChart, FileBarChart as FileBar } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { fetchEmployees, fetchLeaveRequests, fetchAttendanceRecords, fetchAssets } from "../services/workforceApi.js";

const defaultMonthly = [
  { month: "Jan", present: 92, absent: 5, late: 3 },
  { month: "Feb", present: 94, absent: 3, late: 3 },
  { month: "Mar", present: 91, absent: 6, late: 3 },
];

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

  useEffect(() => {
    (async () => {
      try {
        const [emps, lvs, atd, asts] = await Promise.all([
          fetchEmployees(),
          fetchLeaveRequests(),
          fetchAttendanceRecords(),
          fetchAssets(),
        ]);
        setEmployees(emps || []);
        setLeaves(lvs || []);
        setAttendance(atd || []);
        setAssets(asts || []);
      } catch (e) {
        // ignore — keep defaults
      }
    })();
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

  const monthly = defaultMonthly;

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
