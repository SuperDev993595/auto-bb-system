import { Link, useLocation } from "react-router-dom";
import {
    CalendarCheck,
    ClipboardList,
    DollarSign,
    MessageCircle,
    User,
    PhoneCall,
    Calendar,
    LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
    to: string;
    label: string;
    icon: JSX.Element;
    roles?: string[];
};

const navItems: NavItem[] = [
    { to: "/admin/dashboard/appointments", label: "Appointments", icon: <CalendarCheck size={18} /> },
    { to: "/admin/dashboard/tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
    { to: "/admin/dashboard/collections", label: "Collections", icon: <DollarSign size={18} />, roles: ["admin"] },
    { to: "/admin/dashboard/promotions", label: "Promotions", icon: <MessageCircle size={18} /> },
    { to: "/admin/dashboard/warranty-sales", label: "Warranty Sales", icon: <User size={18} /> },
    { to: "/admin/dashboard/contact-logs", label: "Contact Logs", icon: <PhoneCall size={18} /> },
    { to: "/admin/dashboard/calendar", label: "Calendar", icon: <Calendar size={18} /> },
];

export default function Sidebar() {
    const location = useLocation();
    const { role } = useAuth();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/admin/login";
    };

    return (
        <aside className="bg-gray-900 text-white w-64 flex flex-col min-h-screen p-4 space-y-4">
            <div className="text-xl font-bold text-yellow-400 mb-6">Auto Secretary</div>

            <nav className="flex-1 space-y-2">
                {navItems
                    .filter(item => !item.roles || item.roles.includes(role))
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

            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
            >
                <LogOut size={16} />
                Logout
            </button>
        </aside>
    );
}
