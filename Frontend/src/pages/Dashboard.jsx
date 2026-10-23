import { createElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock3,
  Plus,
  Users,
} from "lucide-react";
import { fetchDashboardSummary, fetchDepartments } from "../services/workforceApi.js";

const colors = [
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
];

function employeeName(employee) {
  return [employee.firstName, employee.lastName].filter(Boolean).join(" ") || "Employee";
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [dashboardData, departments] = await Promise.all([
          fetchDashboardSummary(),
          fetchDepartments({ limit: 100 }),
        ]);
        if (!cancelled) {
          setSummary(dashboardData);
          setDepartmentCount(departments.length);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.message ||
              "Could not load dashboard data from the server."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const isSelf = summary?.scope === "self";
  const stats = isSelf
    ? [
        {
          title: "My Profile",
          value: summary.employee?.employeeCode || "—",
          icon: Users,
          style: "bg-indigo-50 text-indigo-600",
        },
        {
          title: "Pending Leaves",
          value: summary.leaveRequests?.pending ?? 0,
          icon: Clock3,
          style: "bg-amber-50 text-amber-600",
        },
        {
          title: "Approved Leaves",
          value: summary.leaveRequests?.approved ?? 0,
          icon: CalendarCheck,
          style: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Attendance Records",
          value: summary.attendance?.recordedDays ?? 0,
          icon: Building2,
          style: "bg-sky-50 text-sky-600",
        },
      ]
    : [
        {
          title: "Total Employees",
          value: summary?.employees?.total ?? 0,
          icon: Users,
          style: "bg-indigo-50 text-indigo-600",
        },
        {
          title: "Active Employees",
          value: summary?.employees?.active ?? 0,
          icon: CalendarCheck,
          style: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Departments",
          value: departmentCount,
          icon: Building2,
          style: "bg-sky-50 text-sky-600",
        },
        {
          title: "Pending Leaves",
          value: summary?.leaveRequests?.pending ?? 0,
          icon: Clock3,
          style: "bg-amber-50 text-amber-600",
        },
      ];

  const recentEmployees = summary?.recentEmployees || [];
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSelf
              ? "Your workforce information and recent activity."
              : "Your latest workforce information from the server."}
          </p>
        </div>

        {!isSelf && (
          <Link
            to="/employees"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Manage Employees
          </Link>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" className="text-sm text-slate-500">Loading dashboard…</p>
      ) : summary ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className={`inline-flex rounded-xl p-3 ${stat.style}`}>
                  {createElement(stat.icon, { size: 21 })}
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
              </article>
            ))}
          </section>

          {!isSelf && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Employees</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Recently added people in your organization
                  </p>
                </div>
                <Link
                  to="/employees"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>

              {recentEmployees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-3 font-semibold">Employee</th>
                        <th className="px-4 py-3 font-semibold">Department</th>
                        <th className="px-4 py-3 font-semibold">Designation</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentEmployees.map((employee, index) => (
                        <tr key={employee._id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${colors[index % colors.length]}`}
                              >
                                {employeeName(employee)
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((part) => part[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {employeeName(employee)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {employee.employeeCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {employee.departmentId?.name || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {employee.designation || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {employee.employmentStatus === "active" ? "Active" : "Inactive"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="border-t border-slate-100 px-6 py-10 text-center text-sm text-slate-500">
                  No recent employees to show.
                </p>
              )}
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}

export default Dashboard;
