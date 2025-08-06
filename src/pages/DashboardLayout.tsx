import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Shared/Sidebar";
import Header from "../components/Shared/Header";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const storedEmail = localStorage.getItem("email");

        if (!storedRole || !storedEmail) {
            navigate("/admin/login");
        } else {
            setRole(storedRole);
            setEmail(storedEmail);
        }
    }, [navigate]);

    if (!role || !email) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-600 text-sm">
                Redirecting to login...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ role, email }}>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <div className="flex flex-col flex-1 bg-gray-100">
                    <Header />

                    <main className="flex-1 overflow-y-auto p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AuthContext.Provider>
    );
}
