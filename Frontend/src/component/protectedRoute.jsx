
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="p-8 text-center text-slate-500">Restoring session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
