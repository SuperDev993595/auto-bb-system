import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/admin/DashboardLayout";

// Dashboard Pages
import AppointmentsPage from "./pages/AppointmentsPage";
import TasksPage from "./pages/TasksPage";
import PromotionsPage from "./pages/PromotionsPage";
import ContactLogsPage from "./pages/ContactLogsPage";

// New CRM Pages
import CustomerList from "./pages/customers/CustomerList";
import CustomerDetail from "./pages/customers/CustomerDetail";
import ServicesPage from "./pages/ServicesPage";
import RemindersPage from "./pages/RemindersPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<HomePage />} />

      {/* Admin redirect */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      
      {/* Login Page */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Dashboard Layout */}
      <Route path="/admin/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contact-logs" element={<ContactLogsPage />} />
      </Route>
      
      {/* Catch-all route for 404s */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
