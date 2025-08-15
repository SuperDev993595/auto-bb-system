import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/admin/DashboardLayout";

// Dashboard Pages
import AppointmentsPage from "./pages/AppointmentsPage";
import TasksPage from "./pages/TasksPage";
import PromotionsPage from "./pages/PromotionsPage";
import ContactLogsPage from "./pages/ContactLogsPage";
import MailChimpPage from "./pages/MailChimpPage";
import LiveChatPage from "./pages/LiveChatPage";
import YellowPagesPage from "./pages/YellowPagesPage";
import FileUploadPage from "./pages/FileUploadPage";

// New CRM Pages
import CustomerList from "./pages/customers/CustomerList";
import CustomerDetail from "./pages/customers/CustomerDetail";
import ServicesPage from "./pages/ServicesPage";
import RemindersPage from "./pages/RemindersPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import Dashboard from "./pages/dashboard/Dashboard";

// Public Website Pages
import PublicLayout from "./components/PublicWebsite/PublicLayout";
import PublicHomePage from "./pages/PublicWebsite/HomePage";
import PublicServicesPage from "./pages/PublicWebsite/ServicesPage";
import PublicAboutPage from "./pages/PublicWebsite/AboutPage";
import PublicContactPage from "./pages/PublicWebsite/ContactPage";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Website Routes */}
      <Route path="/" element={<PublicLayout><PublicHomePage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><PublicServicesPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><PublicAboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><PublicContactPage /></PublicLayout>} />
      <Route path="/appointments" element={<PublicLayout><PublicHomePage /></PublicLayout>} />

      {/* Admin redirect */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      
      {/* Login Page */}
      <Route 
        path="/admin/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Protected Admin Dashboard Layout */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute requireSuperAdmin>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contact-logs" element={<ContactLogsPage />} />
        <Route path="mailchimp" element={<MailChimpPage />} />
        <Route path="live-chat" element={<LiveChatPage />} />
        <Route path="yellowpages" element={<YellowPagesPage />} />
        <Route path="files" element={<FileUploadPage />} />
      </Route>
      
      {/* Catch-all route for 404s */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
