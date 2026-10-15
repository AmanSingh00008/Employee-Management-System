
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../component/layout/Sidebar";
import Topbar from "../component/layout/Topbar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar openSidebar={openSidebar} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
