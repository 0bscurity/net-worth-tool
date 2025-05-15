// src/App.jsx
import "./App.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddAccountPage from "./pages/AddAccountPage";
import EditAccountPage from "./pages/EditAccountPage";
import AccountDetailPage from "./pages/AccountDetailPage";
import ProjectionsList from "./pages/ProjectionsList";
import ProjectionForm from "./pages/ProjectionForm";
import ProjectionDetail from "./pages/ProjectionDetail";
import AddSubuserPage from "./pages/AddSubuserPage";
import SubuserDetailPage from "./pages/SubuserDetailPage";

// Layout wrapper for authenticated pages (with container)
function ContainerLayout() {
  return (
    <div className="min-h-screen bg-base-200 app-background">
      <Navbar />
      <main className="container mx-auto px-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Home with full-bleed and Navbar */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />

      {/* All other routes use ContainerLayout */}
      <Route element={<ContainerLayout />}>        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-account" element={<AddAccountPage />} />
        <Route path="/edit-account/:id" element={<EditAccountPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />

        {/* projections */}
        <Route path="/projections" element={<ProjectionsList />} />
        <Route path="/projections/new" element={<ProjectionForm />} />
        <Route path="/projections/:id" element={<ProjectionDetail />} />
        <Route path="/projections/:id/edit" element={<ProjectionForm />} />

        {/* sub-users */}
        <Route path="/sub-users/new" element={<AddSubuserPage />} />
        <Route path="/sub-users/:id" element={<SubuserDetailPage />} />
      </Route>

      {/* Fallback back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}