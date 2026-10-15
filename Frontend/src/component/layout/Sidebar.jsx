
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Laptop,
  ChartNoAxesCombined,
  Settings,
  BriefcaseBusiness,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Departments", path: "/departments", icon: Building2 },
  { name: "Leave Management", path: "/leaves", icon: CalendarDays },
  { name: "Attendance", path: "/attendance", icon: ClipboardCheck },
  { name: "Assets", path: "/assets", icon: Laptop },
  { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({ isOpen, closeSidebar }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                WorkforceHub
              </h1>
              <p className="text-xs text-slate-500">People management</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {menuItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700">
                Workspace status
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Your HR workspace is ready to configure.
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            WorkforceHub © 2026
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
