import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin");
    const navigate = useNavigate();

    const handleLogin = () => {
        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        navigate("/admin/dashboard/appointments");
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white p-8 shadow rounded w-96">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <input
                    className="w-full p-2 border mb-3"
                    placeholder="Email"
                    onChange={e => setEmail(e.target.value)}
                />
                <select className="w-full p-2 border mb-4" onChange={e => setRole(e.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="subadmin">Sub-Admin</option>
                </select>
                <button
                    className="bg-yellow-400 w-full p-2 rounded font-semibold"
                    onClick={handleLogin}
                >
                    Login
                </button>
            </div>
        </div>
    );
}
