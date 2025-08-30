import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import PerformanceMonitor from "./components/Performance/PerformanceMonitor";
import DashboardQuickAccess from "./components/Shared/DashboardQuickAccess";
import HomePage from "./pages/HomePage";
import DashboardLayout from "./pages/admin/DashboardLayout";

// Unified Authentication
import UnifiedAuthPage from "./components/Auth/UnifiedAuthPage";

// Customer Layout & Pages
import CustomerLayout from "./components/CustomerLayout/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerVehicles from "./pages/customer/CustomerVehicles";
import CustomerAppointments from "./pages/customer/CustomerAppointments";
import CustomerServices from "./pages/customer/CustomerServices";
import CustomerInvoices from "./pages/customer/CustomerInvoices";
import CustomerMessages from "./pages/customer/CustomerMessages";
import CustomerNotifications from "./pages/customer/CustomerNotifications";
import CustomerProfile from "./pages/customer/CustomerProfile";


// Enhanced Customer Features
import CustomerServiceHistory from "./pages/customer/CustomerServiceHistory";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerRewards from "./pages/customer/CustomerRewards";
import CustomerSupport from "./pages/customer/CustomerSupport";
import CustomerPreferences from "./pages/customer/CustomerPreferences";

// Dashboard Pages
import AppointmentsPage from "./pages/AppointmentsPage";
import TasksPage from "./pages/TasksPage";
import PromotionsPage from "./pages/PromotionsPage";
import ContactLogsPage from "./pages/ContactLogsPage";
import MailChimpPage from "./pages/MailChimpPage";
import MarketingDashboard from "./pages/MarketingDashboard";
import SMSPage from "./pages/SMSPage";
import LiveChatPage from "./pages/LiveChatPage";
import YellowPagesPage from "./pages/YellowPagesPage";
import FileUploadPage from "./pages/FileUploadPage";

// New CRM Pages
import CustomerList from "./pages/customers/CustomerList";
import CustomerDetail from "./pages/customers/CustomerDetail";
import CustomerNew from "./pages/customers/CustomerNew";
import BusinessClientsPage from "./pages/BusinessClientsPage";
import ServicesPage from "./pages/ServicesPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import SystemAdminPage from "./pages/SystemAdminPage";
import RemindersPage from "./pages/RemindersPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import PDFGenerationPage from "./pages/PDFGenerationPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ApprovalDashboard from "./pages/ApprovalDashboard";
import JobBoardPage from "./pages/JobBoardPage";
import MembershipPlansPage from "./pages/MembershipPlansPage";
import WarrantyManagementPage from "./pages/WarrantyManagementPage";
import SalesRecordsPage from "./pages/SalesRecordsPage";
import CollectionsManagementPage from "./pages/CollectionsManagementPage";

// Public Website Pages
import PublicLayout from "./components/PublicWebsite/PublicLayout";
import PublicHomePage from "./pages/PublicWebsite/HomePage";
import PublicServicesPage from "./pages/PublicWebsite/ServicesPage";
import PublicAboutPage from "./pages/PublicWebsite/AboutPage";
import PublicContactPage from "./pages/PublicWebsite/ContactPage";
import CustomerMemberships from "./pages/customer/CustomerMemberships";
import CustomerWarranties from "./pages/customer/CustomerWarranties";

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
    <>
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout><PublicHomePage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><PublicServicesPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><PublicAboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><PublicContactPage /></PublicLayout>} />
        <Route path="/appointments" element={<PublicLayout><PublicHomePage /></PublicLayout>} />

        {/* Unified Authentication Routes */}
        <Route path="/auth/login" element={<UnifiedAuthPage />} />
        <Route path="/auth/register" element={<UnifiedAuthPage />} />
        
        {/* Legacy Routes - Redirect to Unified Auth */}
        <Route path="/admin/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/admin/register" element={<Navigate to="/auth/register" replace />} />
        <Route path="/customer/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/customer/register" element={<Navigate to="/auth/register" replace />} />
        
        {/* Admin redirect */}
        <Route path="/admin" element={<Navigate to="/auth/login" replace />} />

      {/* Protected Admin Dashboard Layout */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireAnyAdmin>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerNew />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
                              <Route path="business-clients" element={<BusinessClientsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="sales-records" element={<SalesRecordsPage />} />
        <Route path="collections" element={<CollectionsManagementPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route 
          path="reports" 
          element={
            <ProtectedRoute requireAnyAdmin>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="approvals" element={<ApprovalDashboard />} />
        <Route path="job-board" element={<JobBoardPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="contact-logs" element={<ContactLogsPage />} />
        <Route path="mailchimp" element={<MailChimpPage />} />
        <Route path="marketing" element={<MarketingDashboard />} />
        <Route path="sms" element={<SMSPage />} />
        <Route path="live-chat" element={<LiveChatPage />} />
        <Route path="yellowpages" element={<YellowPagesPage />} />
        <Route path="membership-plans" element={<MembershipPlansPage />} />
        <Route path="warranty-management" element={<WarrantyManagementPage />} />
        {/* <Route path="files" element={<FileUploadPage />} />
        <Route path="pdf-generation" element={<PDFGenerationPage />} /> */}
        <Route 
          path="system-admin" 
          element={
            <ProtectedRoute requireSuperAdmin>
              <SystemAdminPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Protected Customer Dashboard Routes */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute requireCustomer>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="vehicles" element={<CustomerVehicles />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="services" element={<CustomerServices />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="messages" element={<CustomerMessages />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="profile" element={<CustomerProfile />} />

        
        {/* Enhanced Customer Features */}
        <Route path="service-history" element={<CustomerServiceHistory />} />
        <Route path="payments" element={<CustomerPayments />} />
        <Route path="rewards" element={<CustomerRewards />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="preferences" element={<CustomerPreferences />} />
        <Route path="memberships" element={<CustomerMemberships />} />
        <Route path="warranties" element={<CustomerWarranties />} />
      </Route>
      
        {/* Catch-all route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Performance Monitor - Only show in development */}
      {import.meta.env.DEV && (
        <PerformanceMonitor enabled={true} showDetails={true} />
      )}
      
      {/* Dashboard Quick Access Button */}
      <DashboardQuickAccess />
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}
