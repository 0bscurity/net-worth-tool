import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddAccountPage from "./pages/AddAccountPage";
import EditAccountPage from "./pages/EditAccountPage";
import AccountDetailPage from "./pages/AccountDetailPage";
// import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 app-background">
      <Navbar />
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* <Route element={<ProtectedRoute redirectTo="/" />}> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-account" element={<AddAccountPage />} />
            <Route path="/edit-account/:id" element={<EditAccountPage />} />
            <Route path="/accounts/:id" element={<AccountDetailPage />} />
          {/* </Route> */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
