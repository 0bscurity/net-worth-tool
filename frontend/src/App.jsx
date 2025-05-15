import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 app-background">
      <Navbar />
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-account" element={<AddAccountPage />} />
          <Route path="/edit-account/:id" element={<EditAccountPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />

          {/* projections */}
          <Route path="/projections" element={<ProjectionsList />} />
          <Route path="/projections/new" element={<ProjectionForm />} />
          <Route path="/projections/:id" element={<ProjectionDetail />} />
          <Route path="/projections/:id/edit" element={<ProjectionForm />} />

          <Route path="/sub-users/new" element={<AddSubuserPage />} />
          <Route path="/sub-users/:id" element={<SubuserDetailPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
