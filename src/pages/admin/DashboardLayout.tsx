import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Shared/Sidebar";
import Header from "../../components/Shared/Header";
import { AuthContext } from "../../context/AuthContext";
import { useEffect, useState } from "react";

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
        <AuthContext.Provider value={{ role, email: localStorage.getItem("email") || "" }}>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <div className="flex flex-col flex-1 bg-gray-100">
                    <Header />

                    <main className="flex-1 p-6 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AuthContext.Provider>
    );
}
