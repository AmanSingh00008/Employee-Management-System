
import {
  Users,
  Building2,
  CalendarCheck,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  ChevronDown,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  CircleX,
  ArrowRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  {
    title: "Total Employees",
    value: "248",
    change: "+12.5%",
    description: "vs. last month",
    positive: true,
    icon: Users,
    iconStyle: "bg-indigo-50 text-indigo-600",
    data: [25, 35, 30, 48, 40, 55, 50, 68],
  },
  {
    title: "Departments",
    value: "12",
    change: "+2",
    description: "new this quarter",
    positive: true,
    icon: Building2,
    iconStyle: "bg-sky-50 text-sky-600",
    data: [20, 25, 25, 35, 30, 40, 38, 48],
  },
  {
    title: "Present Today",
    value: "221",
    change: "89.1%",
    description: "attendance rate",
    positive: true,
    icon: CalendarCheck,
    iconStyle: "bg-emerald-50 text-emerald-600",
    data: [45, 42, 55, 50, 65, 58, 75, 80],
  },
  {
    title: "Pending Leaves",
    value: "17",
    change: "-3",
    description: "vs. last week",
    positive: true,
    icon: Clock3,
    iconStyle: "bg-amber-50 text-amber-600",
    data: [55, 48, 52, 40, 45, 30, 35, 25],
  },
];

const employeeGrowth = [
  { month: "Jan", employees: 165 },
  { month: "Feb", employees: 178 },
  { month: "Mar", employees: 184 },
  { month: "Apr", employees: 195 },
  { month: "May", employees: 207 },
  { month: "Jun", employees: 218 },
  { month: "Jul", employees: 225 },
  { month: "Aug", employees: 238 },
  { month: "Sep", employees: 248 },
];

const departmentData = [
  { name: "Engineering", value: 82, color: "#6366f1" },
  { name: "Marketing", value: 38, color: "#38bdf8" },
  { name: "Sales", value: 54, color: "#34d399" },
  { name: "HR & Finance", value: 29, color: "#fbbf24" },
  { name: "Operations", value: 45, color: "#c084fc" },
];

const employees = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@company.com",
    initials: "AS",
    color: "bg-indigo-100 text-indigo-700",
    department: "Engineering",
    position: "Frontend Developer",
    status: "Active",
    joined: "Sep 12, 2026",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@company.com",
    initials: "PP",
    color: "bg-pink-100 text-pink-700",
    department: "Marketing",
    position: "Marketing Manager",
    status: "Active",
    joined: "Sep 10, 2026",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@company.com",
    initials: "RV",
    color: "bg-amber-100 text-amber-700",
    department: "Engineering",
    position: "Backend Developer",
    status: "On Leave",
    joined: "Sep 08, 2026",
  },
  {
    name: "Ananya Singh",
    email: "ananya.singh@company.com",
    initials: "AS",
    color: "bg-emerald-100 text-emerald-700",
    department: "Human Resources",
    position: "HR Executive",
    status: "Active",
    joined: "Sep 05, 2026",
  },
  {
    name: "Kabir Mehta",
    email: "kabir.mehta@company.com",
    initials: "KM",
    color: "bg-sky-100 text-sky-700",
    department: "Sales",
    position: "Sales Executive",
    status: "Inactive",
    joined: "Sep 02, 2026",
  },
];

const leaveRequests = [
  {
    name: "Riya Kapoor",
    initials: "RK",
    color: "bg-pink-100 text-pink-700",
    type: "Casual Leave",
    dates: "Oct 19 – Oct 20",
    days: "2 days",
  },
  {
    name: "Dev Shah",
    initials: "DS",
    color: "bg-sky-100 text-sky-700",
    type: "Sick Leave",
    dates: "Oct 20 – Oct 21",
    days: "2 days",
  },
  {
    name: "Meera Joshi",
    initials: "MJ",
    color: "bg-amber-100 text-amber-700",
    type: "Annual Leave",
    dates: "Oct 22 – Oct 25",
    days: "4 days",
  },
];

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
          <Icon size={21} />
        </div>
        <button
          type="button"
          aria-label={`More options for ${stat.title}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {stat.title}
      </p>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">
          {stat.value}
        </h3>

        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stat.data.map((value, index) => ({ index, value }))}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                fill="#e0e7ff"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {stat.positive ? (
          <ArrowUpRight size={15} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={15} className="text-emerald-600" />
        )}
        <span className="font-semibold text-emerald-600">
          {stat.change}
        </span>
        <span className="text-slate-400">{stat.description}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700",
    "On Leave": "bg-amber-50 text-amber-700",
    Inactive: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-emerald-500"
            : status === "On Leave"
              ? "bg-amber-500"
              : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}

function Dashboard() {
  return (
    <div className="space-y-7">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Monday, October 19, 2026
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening with your workforce today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.alert("Connect this action to the employee form next.")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <SectionHeading
            title="Employee Growth"
            subtitle="Workforce growth over the last nine months"
            action={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                This year <ChevronDown size={15} />
              </button>
            }
          />

          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={employeeGrowth}
                margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  domain={[0, "dataMax + 30"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="employees"
                  name="Employees"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#growthFill)"
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            title="Department Distribution"
            subtitle="Employees by department"
            action={
              <button
                type="button"
                aria-label="Department chart options"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
              >
                <MoreHorizontal size={20} />
              </button>
            }
          />

          <div className="relative mx-auto h-48 w-full max-w-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  stroke="none"
                >
                  {departmentData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">248</span>
              <span className="text-xs text-slate-500">Employees</span>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {departmentData.map((department) => (
              <div
                key={department.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: department.color }}
                  />
                  <span className="truncate text-slate-600">
                    {department.name}
                  </span>
                </div>
                <span className="font-semibold text-slate-800">
                  {department.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employees and leaves */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white 2xl:col-span-2">
          <div className="p-5 sm:p-6">
            <SectionHeading
              title="Recent Employees"
              subtitle="Recently added people to your organization"
              action={
                <a
                  href="/employees"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all <ArrowRight size={16} />
                </a>
              }
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.email} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${employee.color}`}
                        >
                          {employee.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {employee.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {employee.position}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {employee.department}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={employee.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {employee.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-xs text-slate-500">
              Showing 5 of 248 employees
            </span>
            <a
              href="/employees"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage employees
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            title="Leave Requests"
            subtitle="Requests waiting for review"
            action={
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                17 pending
              </span>
            }
          />

          <div className="space-y-5">
            {leaveRequests.map((leave) => (
              <div
                key={leave.name}
                className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${leave.color}`}
                  >
                    {leave.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {leave.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {leave.type}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      {leave.dates}
                      <span>·</span>
                      {leave.days}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 pl-[52px]">
                  <button
                    type="button"
                    onClick={() => window.alert("Leave approval will be implemented next.")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <CircleCheck size={15} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => window.alert("Leave rejection will be implemented next.")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <CircleX size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/leaves"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            View all requests <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Bottom information banner */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-indigo-600 p-6 text-white sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <h2 className="font-semibold">Your workforce, one workspace.</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-indigo-100">
              Keep employee records, attendance, leave requests and company
              assets organized in one place.
            </p>
          </div>
        </div>

        <a
          href="/employees"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Explore employees <ArrowRight size={17} />
        </a>
      </section>
    </div>
  );
}

export default Dashboard;
