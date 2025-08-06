import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md">
            <h1 className="text-xl font-bold text-yellow-400">Virtual Auto Secretary</h1>
            <nav className="space-x-6 text-sm">
                <Link to="/" className="text-white hover:text-yellow-400">Home</Link>
                <Link to="/services/appointments" className="text-white hover:text-yellow-400">Services</Link>
                <Link to="/contact" className="text-white hover:text-yellow-400">Contact</Link>
                <Link to="/admin/login" className="text-yellow-400 font-semibold hover:underline">Admin Login</Link>
            </nav>
        </header>
    );
}
