import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function AdminHeader() {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = () => {
        logout();
    };

    // Show loading state if user data is not yet loaded
    if (isLoading || !user) {
        return (
            <header className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-yellow-400">Virtual Auto Secretary</h1>
                    <span className="ml-4 text-sm text-gray-300">Admin Dashboard</span>
                </div>
                <div className="text-gray-300 text-sm">Loading...</div>
            </header>
        );
    }

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-yellow-400">Virtual Auto Secretary</h1>
                <span className="ml-4 text-sm text-gray-300">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2 text-white">
                    <FaUser className="w-4 h-4 text-gray-300" />
                    <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                    <span className="text-xs text-gray-400">({user?.role || 'Admin'})</span>
                </div>
                
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition duration-200"
                >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}
