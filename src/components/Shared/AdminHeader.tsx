import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiUser, HiLogout, HiBell, HiCog } from 'react-icons/hi';
import PendingApprovalsCounter from './PendingApprovalsCounter';
import NotificationCenter from './NotificationCenter';

export default function AdminHeader() {
    const { user, logout, isLoading } = useAuth();
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    // Show loading state if user data is not yet loaded
    if (isLoading || !user) {
        return (
            <header className="bg-white border-b border-secondary-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link to="/" className="hover:text-primary-600 transition-colors">
                            <h1 className="text-xl font-bold text-primary-600">AutoCRM Pro</h1>
                        </Link>
                        <span className="ml-4 text-sm text-secondary-600 bg-secondary-100 px-3 py-1 rounded-full">Admin Dashboard</span>
                    </div>
                    <div className="text-secondary-500 text-sm">Loading...</div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white border-b border-secondary-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="hover:text-primary-600 transition-colors">
                        <h1 className="text-xl font-bold text-primary-600">AutoCRM Pro</h1>
                    </Link>
                    <span className="ml-4 text-sm text-secondary-600 bg-secondary-100 px-3 py-1 rounded-full">Admin Dashboard</span>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Pending Approvals Counter */}
                    <Link 
                        to="/admin/dashboard/approvals"
                        className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-all duration-200 relative"
                    >
                        <PendingApprovalsCounter color="black" />
                    </Link>
                    
                    {/* User Info */}
                    <div className="flex items-center space-x-3 bg-secondary-50 px-4 py-2 rounded-xl">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <HiUser className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="text-sm">
                            <div className="font-medium text-secondary-900">{user?.name || 'Admin'}</div>
                            <div className="text-xs text-secondary-500 capitalize">{user?.role || 'Admin'}</div>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-medium"
                    >
                        <HiLogout className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            
            {/* Notification Center */}
            <NotificationCenter 
                isOpen={isNotificationCenterOpen}
                onClose={() => setIsNotificationCenterOpen(false)}
            />
        </header>
    );
}
