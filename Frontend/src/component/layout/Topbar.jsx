
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../../context/authContext.jsx";

function Topbar({ openSidebar }) {
  const { user } = useAuth();
  const initials = user?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={openSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            HR Workspace
          </p>
          <p className="hidden text-xs text-slate-500 sm:block">
            Manage your people, all in one place
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <label className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={17} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-400">
            /
          </span>
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role?.replaceAll("_", " ") || "Employee"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
