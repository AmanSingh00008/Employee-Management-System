
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "../context/authContext.jsx";

// function ProtectedRoute() {
//   const { user, initializing } = useAuth();
//   const location = useLocation();

//   // While session restore is in progress, show nothing (avoids flash redirect)
//   if (initializing) {
//     return null;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return <Outlet />;
// }

// export default ProtectedRoute;
