import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  User,
  Car,
  FileText,
  Bell,
  Settings,
  BarChart3,
  Shield,
  Crown,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
  Wrench,
  Database,
  Download,
  Eye,
  Plus
} from 'lucide-react';

// Import all our Customer Portal components
import MembershipCard from '../../components/customer/MembershipCard';
import WarrantyCard from '../../components/customer/WarrantyCard';
import MembershipComparison from '../../components/customer/MembershipComparison';
import WarrantyClaimForm from '../../components/customer/WarrantyClaimForm';
import CustomerNotificationCenter from '../../components/customer/CustomerNotificationCenter';
import MembershipAnalytics from '../../components/customer/MembershipAnalytics';
import WarrantyAnalytics from '../../components/customer/WarrantyAnalytics';
import CustomerLTVAnalytics from '../../components/customer/CustomerLTVAnalytics';
import AutomatedMarketingCampaigns from '../../components/customer/AutomatedMarketingCampaigns';
import AdvancedPaymentOptions from '../../components/customer/AdvancedPaymentOptions';
import EnhancedVehicleDatabase from '../../components/customer/EnhancedVehicleDatabase';
import RealTimeCommunication from '../../components/customer/RealTimeCommunication';
import AdvancedReportingExport from '../../components/customer/AdvancedReportingExport';

interface CustomerPortalDashboardProps {}

export default function CustomerPortalDashboard({}: CustomerPortalDashboardProps) {
  const { customerId } = useParams<{ customerId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showChat, setShowChat] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      // Mock customer data - replace with actual API call
      const mockCustomerData = {
        id: customerId,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        joinDate: '2023-01-15',
        totalSpent: 8500,
        vehicles: 2,
        appointments: 12,
        memberships: [
          {
            id: '1',
            planName: 'Premium Membership',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            monthlyFee: 49.99,
            benefitsUsed: 8,
            totalBenefits: 12
          }
        ],
        warranties: [
          {
            id: '1',
            vehicleId: '1',
            vehicleMake: 'Honda',
            vehicleModel: 'Civic',
            type: 'Extended Warranty',
            status: 'active',
            startDate: '2023-06-01',
            endDate: '2026-06-01',
            coverage: 'Comprehensive',
            deductible: 100
          }
        ]
      };
      
      setCustomerData(mockCustomerData);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'memberships', label: 'Memberships', icon: Crown },
    { id: 'warranties', label: 'Warranties', icon: Shield },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    if (!customerData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">${customerData.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.vehicles}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.appointments}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Memberships</p>
                    <p className="text-2xl font-bold text-gray-900">{customerData.memberships.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Crown className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Oil change completed on Honda Civic</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Premium membership renewed</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Appointment scheduled for brake service</span>
                  <span className="text-xs text-gray-400">3 days ago</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors">
                <Calendar className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">Schedule Appointment</h3>
                <p className="text-blue-100 text-sm">Book your next service</p>
              </button>

              <button className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors">
                <Shield className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">File Warranty Claim</h3>
                <p className="text-green-100 text-sm">Submit a warranty request</p>
              </button>

              <button className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors">
                <MessageSquare className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-purple-100 text-sm">Get help from our team</p>
              </button>
            </div>
          </div>
        );

      case 'memberships':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Memberships</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Compare Plans</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customerData.memberships.map((membership: any) => (
                <MembershipCard
                  key={membership.id}
                  membership={membership}
                  onManage={() => console.log('Manage membership')}
                  onCancel={() => console.log('Cancel membership')}
                />
              ))}
            </div>

            <MembershipComparison />
          </div>
        );

      case 'warranties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Warranties</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Warranty</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customerData.warranties.map((warranty: any) => (
                <WarrantyCard
                  key={warranty.id}
                  warranty={warranty}
                  onViewDetails={() => console.log('View warranty details')}
                  onUpdateMileage={() => console.log('Update mileage')}
                  onFileClaim={() => console.log('File claim')}
                />
              ))}
            </div>
          </div>
        );

      case 'vehicles':
        return <EnhancedVehicleDatabase customerId={customerId!} />;

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <MembershipAnalytics customerId={customerId!} />
            <WarrantyAnalytics customerId={customerId!} />
            <CustomerLTVAnalytics customerId={customerId!} />
          </div>
        );

      case 'marketing':
        return <AutomatedMarketingCampaigns customerId={customerId!} />;

      case 'payments':
        return <AdvancedPaymentOptions customerId={customerId!} amount={500} />;

      case 'reports':
        return <AdvancedReportingExport customerId={customerId!} />;

      case 'notifications':
        return <CustomerNotificationCenter customerId={customerId!} />;

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue={customerData?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={customerData?.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Marketing communications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Customer Portal</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{customerData?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Live Chat */}
      {showChat && (
        <RealTimeCommunication
          customerId={customerId!}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
