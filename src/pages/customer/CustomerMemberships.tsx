import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown, 
  Star, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search
} from '../../utils/icons';
import MembershipCard from '../../components/customer/MembershipCard';
import MembershipComparison from '../../components/customer/MembershipComparison';

interface Membership {
  id: string;
  planName: string;
  tier: 'basic' | 'premium' | 'elite';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  monthlyFee: number;
  benefitsUsed: number;
  totalBenefits: number;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate: string;
}

export default function CustomerMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockMemberships: Membership[] = [
        {
          id: '1',
          planName: 'Premium Membership',
          tier: 'premium',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 49.99,
          benefitsUsed: 8,
          totalBenefits: 12,
          autoRenew: true,
          paymentMethod: 'Credit Card ****1234',
          nextBillingDate: '2024-02-01'
        },
        {
          id: '2',
          planName: 'Basic Membership',
          tier: 'basic',
          status: 'expired',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          monthlyFee: 19.99,
          benefitsUsed: 5,
          totalBenefits: 8,
          autoRenew: false,
          paymentMethod: 'Credit Card ****5678',
          nextBillingDate: '2023-12-31'
        }
      ];
      
      setMemberships(mockMemberships);
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Shield className="w-5 h-5" />;
      case 'premium':
        return <Star className="w-5 h-5" />;
      case 'elite':
        return <Crown className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const filteredMemberships = memberships.filter(membership => {
    const matchesSearch = membership.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || membership.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Memberships</h1>
            <p className="text-gray-600 mt-1">Manage your service memberships and benefits</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowComparison(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Compare Plans</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Memberships</p>
              <p className="text-2xl font-bold text-blue-600">
                {memberships.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${memberships.filter(m => m.status === 'active').reduce((sum, m) => sum + m.monthlyFee, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Benefits Used</p>
              <p className="text-2xl font-bold text-purple-600">
                {memberships.reduce((sum, m) => sum + m.benefitsUsed, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Billing</p>
              <p className="text-2xl font-bold text-orange-600">
                {memberships.filter(m => m.status === 'active').length > 0 
                  ? new Date(memberships.filter(m => m.status === 'active')[0].nextBillingDate).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search memberships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredMemberships.length} of {memberships.length} memberships
            </span>
          </div>
        </div>
      </div>

      {/* Memberships List */}
      <div className="space-y-4">
        {filteredMemberships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships found</h3>
            <p className="text-gray-600 mb-6">Get started with a membership plan to unlock exclusive benefits.</p>
            <button
              onClick={() => setShowComparison(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Browse Plans</span>
            </button>
          </div>
        ) : (
          filteredMemberships.map((membership) => (
            <div key={membership.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {getTierIcon(membership.tier)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{membership.planName}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.status)}`}>
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ${membership.monthlyFee}/month
                      </span>
                      <span className="text-sm text-gray-600">
                        {membership.benefitsUsed}/{membership.totalBenefits} benefits used
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="ml-2 font-medium">{new Date(membership.startDate).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="ml-2 font-medium">{new Date(membership.endDate).toLocaleDateString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Auto Renew:</span>
                  <span className="ml-2 font-medium">
                    {membership.autoRenew ? (
                      <Check className="w-4 h-4 text-green-500 inline" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 inline" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Membership Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Compare Membership Plans</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <MembershipComparison 
                onSelectPlan={(plan) => {
                  console.log('Selected plan:', plan);
                  setShowComparison(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
