// import { useAuth0 } from "@auth0/auth0-react";
// import { Navigate, Outlet } from "react-router-dom";

// export default function ProtectedRoute({ redirectTo = "/" }) {
//   const { isAuthenticated, isLoading } = useAuth0();

//   // Logging for debug
//   console.log("isAuthenticated:", isAuthenticated);
//   console.log("isLoading:", isLoading);

//   if (isLoading) return <div>Loading...</div>;
//   if (!isAuthenticated) return <Navigate to={redirectTo} />;

//   return <Outlet />;
// }