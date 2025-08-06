import { Routes, Route } from "react-router-dom";
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
    </Routes>
  );
}
