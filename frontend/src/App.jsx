import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { CallbackPage } from "./pages/CallbackPage";
import AddAccountPage from "./pages/AddAccountPage";
import EditAccountPage from "./pages/EditAccountPage";
import AccountDetailPage from "./pages/AccountDetailPage";

export default function App() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/add-account" element={<AddAccountPage />} />
          <Route path="/edit-account/:id" element={<EditAccountPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />{" "}
        </Routes>
      </main>
    </div>
  );
}
