import { Link, useLocation } from "react-router-dom";
import {
    HiHome,
    HiUsers,
    HiCalendar,
    HiOfficeBuilding,
    HiCog,
    HiDocumentText,
    HiCube,
    HiChartBar,
    HiBell,
    HiClipboardList,
    HiChatAlt,
    HiPhone,
    HiMail,
    HiSearch
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
    to: string;
    label: string;
    icon: JSX.Element;
    roles?: string[];
};

const navItems: NavItem[] = [
    // Dashboard Overview
    { to: "/admin/dashboard", label: "Dashboard", icon: <HiHome size={18} /> },
    
    // Core CRM Functions
    { to: "/admin/dashboard/customers", label: "Customers", icon: <HiUsers size={18} /> },
    { to: "/admin/dashboard/appointments", label: "Appointments", icon: <HiCalendar size={18} /> },
    { to: "/admin/dashboard/business-clients", label: "Business Clients", icon: <HiOfficeBuilding size={18} />, roles: ['super_admin', 'admin'] },
    { to: "/admin/dashboard/services", label: "Services", icon: <HiCog size={18} /> },
    
    // Financial & Inventory
    { to: "/admin/dashboard/invoices", label: "Invoices", icon: <HiDocumentText size={18} /> },
    { to: "/admin/dashboard/inventory", label: "Inventory", icon: <HiCube size={18} /> },
    
    // Analytics & Communication
    { to: "/admin/dashboard/reports", label: "Reports", icon: <HiChartBar size={18} />, roles: ['super_admin', 'admin'] },
    { to: "/admin/dashboard/reminders", label: "Reminders", icon: <HiBell size={18} /> },
    { to: "/admin/dashboard/contact-logs", label: "Communication", icon: <HiPhone size={18} /> },
    
    // Operations & Marketing
    { to: "/admin/dashboard/tasks", label: "Tasks", icon: <HiClipboardList size={18} /> },
    { to: "/admin/dashboard/promotions", label: "Promotions", icon: <HiChatAlt size={18} /> },
    
    // Advanced Features
    { to: "/admin/dashboard/marketing", label: "Marketing", icon: <HiMail size={18} />, roles: ['super_admin', 'admin'] },
    { to: "/admin/dashboard/sms", label: "SMS", icon: <HiPhone size={18} />, roles: ['super_admin', 'admin'] },
    { to: "/admin/dashboard/mailchimp", label: "MailChimp", icon: <HiMail size={18} />, roles: ['super_admin', 'admin'] },
    { to: "/admin/dashboard/live-chat", label: "Live Chat", icon: <HiChatAlt size={18} /> },
    { to: "/admin/dashboard/yellowpages", label: "YellowPages", icon: <HiSearch size={18} /> },
    // { to: "/admin/dashboard/files", label: "File Management", icon: <HiUpload size={18} /> },
    // { to: "/admin/dashboard/pdf-generation", label: "PDF Generation", icon: <HiDocument size={18} /> },
    
    // System Administration (Super Admin Only)
    { to: "/admin/dashboard/system-admin", label: "System Administration", icon: <HiCog size={18} />, roles: ['super_admin'] },
];

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <aside className="bg-white text-secondary-900 w-64 flex flex-col h-screen border-r border-secondary-200">
            {/* Fixed Header */}
            <div className="p-6 border-b border-secondary-200 bg-secondary-50 flex-shrink-0">
                <Link to="/" className="block">
                    <div className="text-xl font-bold text-blue-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <HiCog className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-blue-600">
                            AutoCRM Pro
                        </span>
                    </div>
                </Link>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scrollbar sidebar-nav min-h-0">
                {navItems
                    .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                    .map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                location.pathname === item.to 
                                    ? "bg-blue-50 text-blue-700 border border-blue-300" 
                                    : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
                            }`}
                        >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-secondary-200 bg-secondary-50 flex-shrink-0">
                <div className="text-xs text-secondary-600 text-center">
                    v2.0.0 • AutoCRM Pro
                </div>
            </div>
        </aside>
    );
}
