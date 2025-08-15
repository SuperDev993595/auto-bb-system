import { Link, useLocation } from "react-router-dom";
import {
    CalendarCheck,
    ClipboardList,
    MessageCircle,
    PhoneCall,
    Users,
    Wrench,
    FileText,
    Bell,
    BarChart3,
    Package,
    Home,
    Mail,
    MessageSquare,
    Search,
    Upload,
    File,
    Settings
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

type NavItem = {
    to: string;
    label: string;
    icon: JSX.Element;
    roles?: string[];
};

const navItems: NavItem[] = [
    // Dashboard Overview
    { to: "/admin/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    
    // Core CRM Functions
    { to: "/admin/dashboard/appointments", label: "Appointments", icon: <CalendarCheck size={18} /> },
    { to: "/admin/dashboard/customers", label: "Customers", icon: <Users size={18} /> },
    { to: "/admin/dashboard/services", label: "Services", icon: <Wrench size={18} /> },
    
    // Financial & Inventory
    { to: "/admin/dashboard/invoices", label: "Invoices", icon: <FileText size={18} /> },
    { to: "/admin/dashboard/inventory", label: "Inventory", icon: <Package size={18} /> },
    
    // Analytics & Communication
    { to: "/admin/dashboard/reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { to: "/admin/dashboard/reminders", label: "Reminders", icon: <Bell size={18} /> },
    { to: "/admin/dashboard/contact-logs", label: "Communication", icon: <PhoneCall size={18} /> },
    
    // Operations & Marketing
    { to: "/admin/dashboard/tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
    { to: "/admin/dashboard/promotions", label: "Promotions", icon: <MessageCircle size={18} /> },
    
    // Advanced Features
    { to: "/admin/dashboard/mailchimp", label: "MailChimp", icon: <Mail size={18} /> },
    { to: "/admin/dashboard/live-chat", label: "Live Chat", icon: <MessageSquare size={18} /> },
    { to: "/admin/dashboard/yellowpages", label: "YellowPages", icon: <Search size={18} /> },
    { to: "/admin/dashboard/files", label: "File Management", icon: <Upload size={18} /> },
    { to: "/admin/dashboard/pdf-generation", label: "PDF Generation", icon: <File size={18} /> },
    
    // System Administration (Super Admin Only)
    { to: "/admin/dashboard/system-admin", label: "System Administration", icon: <Settings size={18} />, roles: ['super_admin'] },
];

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <aside className="bg-gray-900 text-white w-64 flex flex-col h-screen">
            {/* Fixed Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="text-xl font-bold text-yellow-400">🔧 AutoCRM Pro</div>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-nav">
                {navItems
                    .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                    .map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 transition ${location.pathname === item.to ? "bg-gray-800 text-yellow-400" : "text-gray-300"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
            </nav>
        </aside>
    );
}
