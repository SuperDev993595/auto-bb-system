import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Shared/Sidebar";
import AdminHeader from "../../components/Shared/AdminHeader";
import { useEffect, useState } from "react";

import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Shared/Sidebar";
import AdminHeader from "../../components/Shared/AdminHeader";
import { useEffect, useState } from "react";

export default function DashboardLayout() {
    const [role, setRole] = useState<string>("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (!storedRole) {
            window.location.href = "/admin/login";
        } else {
            setRole(storedRole);
        }
        
        // Load sidebar state from localStorage
        const storedSidebarState = localStorage.getItem("sidebarCollapsed");
        if (storedSidebarState) {
            setSidebarCollapsed(JSON.parse(storedSidebarState));
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    if (!role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-secondary-100">
                <div className="text-center">
                    <div className="loading-spinner-large mb-4"></div>
                    <p className="text-secondary-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-secondary-50 to-secondary-100">
            {/* Sidebar */}
            <Sidebar 
                isCollapsed={sidebarCollapsed} 
                onToggle={toggleSidebar}
                isMobileOpen={mobileSidebarOpen}
            />

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <AdminHeader onToggleSidebar={toggleMobileSidebar} />

                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
