import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/admin/DashboardLayout";

// Dashboard Pages
import AppointmentsPage from "./pages/AppointmentsPage";
import TasksPage from "./pages/TasksPage";
import CollectionsPage from "./pages/CollectionsPage";
import PromotionsPage from "./pages/PromotionsPage";
import WarrantySalesPage from "./pages/WarrantySalesPage";
import ContactLogsPage from "./pages/ContactLogsPage";
import FollowUpCalendar from "./components/CRM/FollowUpCalendar";

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<HomePage />} />

      {/* Login Page */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Dashboard Layout */}
      <Route path="/admin/dashboard" element={<DashboardLayout />}>
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="warranty-sales" element={<WarrantySalesPage />} />
        <Route path="contact-logs" element={<ContactLogsPage />} />
        <Route path="calendar" element={<FollowUpCalendar />} />
      </Route>
    </Routes>
  );
}
