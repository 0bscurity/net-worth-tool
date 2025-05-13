// src/components/ProtectedRoute.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ redirectTo = "/" }) {
  const { isLoading, isAuthenticated } = useAuth0();

  // 1) still checking Auth0 status? show a spinner or nothing
  if (isLoading) return <div className="p-6 text-center">Loading…</div>;

  // 2) not logged in? send them home (or to login)
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  // 3) they’re good — render whatever child routes they asked for
  return <Outlet />;
}
