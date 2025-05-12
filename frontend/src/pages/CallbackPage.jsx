import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";

export const CallbackPage = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-red-500">Authentication Error: {error.message}</p>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-4">Logging you in…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Redirecting...</p>
      </div>
    </>
  );
};
