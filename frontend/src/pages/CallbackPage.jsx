// src/pages/CallbackPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export function CallbackPage() {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error("Auth0 callback error", error);
        // You could show a flash/toast here
        navigate("/", { replace: true });
      } else {
        // If they’re authenticated, send them to the dashboard,
        // otherwise send them home
        const destination = isAuthenticated ? "/dashboard" : "/";
        navigate(destination, { replace: true });
      }
    }
  }, [isLoading, error, isAuthenticated, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting…</p>
    </div>
  );
}
