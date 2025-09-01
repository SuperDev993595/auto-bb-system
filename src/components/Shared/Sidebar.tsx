import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
    Home,
    Users,
    Calendar,
    Building2,
    Settings,
    FileText,
    Package,
    BarChart3,
    Bell,
    ClipboardList,
    MessageCircle,
    Phone,
    Mail,
    Search,
    ChevronDown,
    ChevronRight,
    Wrench,
    Crown,
    Shield,
    Menu,
    X
} from "../../utils/icons";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

type NavItem = {
    to: string;
    label: string;
    icon: JSX.Element;
    roles?: string[];
    badge?: number;
};

interface NavGroup {
    title: string;
    items: NavItem[];
    roles?: string[];
}

const navGroups: NavGroup[] = [
    {
        title: "Overview",
        items: [
            { to: "/admin/dashboard", label: "Dashboard", icon: <Home size={18} /> },
        ]
    },
    {
        title: "Core Operations",
        items: [
            { to: "/admin/dashboard/customers", label: "Customers", icon: <Users size={18} /> },
            { to: "/admin/dashboard/appointments", label: "Appointments", icon: <Calendar size={18} /> },
            { to: "/admin/dashboard/approvals", label: "Approvals", icon: <ClipboardList size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/work-orders", label: "Work Orders", icon: <ClipboardList size={18} /> },
            { to: "/admin/dashboard/job-board", label: "Job Board", icon: <Wrench size={18} /> },
            { to: "/admin/dashboard/tasks", label: "Tasks", icon: <ClipboardList size={18} /> },
        ]
    },
    {
        title: "Business Management",
        items: [
            { to: "/admin/dashboard/services", label: "Services", icon: <Settings size={18} /> },
            { to: "/admin/dashboard/membership-plans", label: "Membership Plans", icon: <Crown size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/warranty-management", label: "Warranty Management", icon: <Shield size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/inventory", label: "Inventory", icon: <Package size={18} /> },
            { to: "/admin/dashboard/business-clients", label: "Business Clients", icon: <Building2 size={18} />, roles: ['super_admin', 'admin'] },
        ]
    },
    {
        title: "Financial",
        items: [
            { to: "/admin/dashboard/invoices", label: "Invoices", icon: <FileText size={18} /> },
            { to: "/admin/dashboard/sales-records", label: "Sales Records", icon: <BarChart3 size={18} /> },
            { to: "/admin/dashboard/reports", label: "Reports", icon: <BarChart3 />, roles: ['super_admin', 'admin'] },
        ]
    },
    {
        title: "Communication",
        items: [
            { to: "/admin/dashboard/reminders", label: "Reminders", icon: <Bell size={18} /> },
            { to: "/admin/dashboard/contact-logs", label: "Contact Logs", icon: <Phone size={18} /> },
            { to: "/admin/dashboard/live-chat", label: "Live Chat", icon: <MessageCircle size={18} /> },
        ]
    },
    {
        title: "Marketing",
        items: [
            { to: "/admin/dashboard/promotions", label: "Promotions", icon: <MessageCircle size={18} /> },
            { to: "/admin/dashboard/marketing", label: "Email Marketing", icon: <Mail size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/sms", label: "SMS", icon: <Phone size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/mailchimp", label: "MailChimp", icon: <Mail size={18} />, roles: ['super_admin', 'admin'] },
            { to: "/admin/dashboard/yellowpages", label: "YellowPages", icon: <Search size={18} /> },
        ]
    },
    {
        title: "System",
        items: [
            { to: "/admin/dashboard/system-admin", label: "Administration", icon: <Settings size={18} />, roles: ['super_admin'] },
        ]
    }
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen?: boolean;
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen = false }: SidebarProps) {
    const location = useLocation();
    const { user } = useAuth();
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [unreadChats, setUnreadChats] = useState(0);

    // Fetch unread chat count
    useEffect(() => {
        const fetchUnreadChats = async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.CHAT}/unread-count`, {
                    headers: getAuthHeaders(),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setUnreadChats(data.data.unreadCount);
                    }
                }
            } catch (error) {
                console.error('Error fetching unread chats:', error);
            }
        };

        fetchUnreadChats();
        
        // Set up interval to refresh unread count
        const interval = setInterval(fetchUnreadChats, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    // Auto-expand groups that contain the current active page
    useEffect(() => {
        navGroups.forEach(group => {
            const hasActiveItem = group.items.some(item => 
                location.pathname === item.to && (!item.roles || item.roles.includes(user?.role || ''))
            );
            if (hasActiveItem && collapsedGroups.has(group.title)) {
                setCollapsedGroups(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(group.title);
                    return newSet;
                });
            }
        });
    }, [location.pathname, user?.role, collapsedGroups]);

    // Update navGroups with unread chat count
    const updatedNavGroups = navGroups.map(group => ({
        ...group,
        items: group.items.map(item => 
            item.to === "/admin/dashboard/live-chat" 
                ? { ...item, badge: unreadChats }
                : item
        )
    }));

    const toggleGroup = (groupTitle: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupTitle)) {
                newSet.delete(groupTitle);
            } else {
                newSet.add(groupTitle);
            }
            return newSet;
        });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onToggle}
                />
            )}
            
            <aside className={`bg-white text-secondary-900 flex flex-col h-screen border-r border-secondary-200 transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-64'
            } lg:relative lg:translate-x-0 ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:static z-50`}>
            {/* Fixed Header */}
            <div className={`p-4 flex-shrink-0 ${
                isCollapsed ? 'px-2' : 'px-4'
            }`}>
                <div className="flex items-center justify-between mb-4">
                    <Link to="/" className="block">
                        <div className="text-xl font-bold text-blue-800 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            {!isCollapsed && (
                                <span className="text-blue-600 whitespace-nowrap">
                                    AutoCRM Pro
                                </span>
                            )}
                        </div>
                    </Link>
                </div>
                
                {/* Toggle Button - Positioned below the logo */}
                <div className="flex justify-center">
                    <button
                        onClick={onToggle}
                        className={`p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${
                            isCollapsed 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-secondary-100 text-secondary-600 hover:bg-blue-50'
                        }`}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Separator */}
            <div className="border-b border-secondary-200 mx-4"></div>

            {/* Scrollable Navigation */}
            <nav className={`flex-1 overflow-y-auto space-y-4 sidebar-scrollbar sidebar-nav min-h-0 ${
                isCollapsed ? 'px-2' : 'px-4'
            }`}>
                {updatedNavGroups
                    .filter(group => !group.roles || group.roles.includes(user?.role || ''))
                    .map(group => {
                        const isGroupCollapsed = collapsedGroups.has(group.title);
                        const hasActiveItem = group.items.some(item => 
                            location.pathname === item.to && (!item.roles || item.roles.includes(user?.role || ''))
                        );
                        
                        return (
                            <div key={group.title} className="space-y-2">
                                {/* Group Header - Clickable for Collapse */}
                                {!isCollapsed && (
                                    <button
                                        onClick={() => toggleGroup(group.title)}
                                        className={`w-full px-3 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider transition-colors rounded-lg ${
                                            hasActiveItem 
                                                ? 'text-blue-600 bg-blue-50' 
                                                : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50'
                                        }`}
                                    >
                                        <span>{group.title}</span>
                                        {isGroupCollapsed ? (
                                            <ChevronRight size={14} />
                                        ) : (
                                            <ChevronDown size={14} />
                                        )}
                                    </button>
                                )}
                                
                                {/* Group Items */}
                                {(!isCollapsed && !isGroupCollapsed) && (
                                    <div className="space-y-1 ml-2">
                                        {group.items
                                            .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                                            .map(item => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                                                        location.pathname === item.to 
                                                            ? "bg-blue-50 text-blue-700 border border-blue-300" 
                                                            : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
                                                    }`}
                                                >
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                    {item.badge && item.badge > 0 && (
                                                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                    </div>
                                )}
                                
                                {/* Collapsed Sidebar - Show only icons */}
                                {isCollapsed && (
                                    <div className="space-y-1">
                                        {group.items
                                            .filter(item => !item.roles || item.roles.includes(user?.role || ''))
                                            .map(item => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={`flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 relative ${
                                                        location.pathname === item.to 
                                                            ? "bg-blue-50 text-blue-700 border border-blue-300" 
                                                            : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
                                                    }`}
                                                    title={item.label}
                                                >
                                                    {item.icon}
                                                    {item.badge && item.badge > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </nav>

            {/* Footer */}
            <div className={`p-4 border-t border-secondary-200 bg-secondary-50 flex-shrink-0 ${
                isCollapsed ? 'px-2' : 'px-4'
            }`}>
                {!isCollapsed && (
                    <div className="text-xs text-secondary-600 text-center">
                        v2.0.0 • AutoCRM Pro
                    </div>
                )}
                            </div>
            </aside>
        </>
    );
}
