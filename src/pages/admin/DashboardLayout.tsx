import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Shared/Sidebar";
import AdminHeader from "../../components/Shared/AdminHeader";
import { useEffect, useState } from "react";
import "../../components/Shared/Sidebar.css";

export default function DashboardLayout() {
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (!storedRole) {
            window.location.href = "/admin/login";
        } else {
            setRole(storedRole);
        }
    }, []);

    if (!role) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-600">
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-col flex-1 bg-gray-100">
                <AdminHeader />

                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
