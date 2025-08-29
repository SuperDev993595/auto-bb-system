import React, { useState, useEffect, useContext } from 'react';
import { 
  Shield, 
  Crown, 
  Star, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Plus,
  Trash2,
  Eye,
  Download,
  Filter,
  Search
} from '../../utils/icons';
import MembershipComparison from '../../components/customer/MembershipComparison';
import { AuthContext } from '../../context/AuthContext';
import { User } from '../../services/auth';

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
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Type guard to ensure user exists and is a customer
  const isCustomerUser = (user: any): user is User & { customerId?: string } => {
    return user && user.role === 'customer';
  };

  useEffect(() => {
    if (user && isCustomerUser(user)) {
      loadMemberships();
    }
  }, [user]);

  // Ensure memberships is always an array
  useEffect(() => {
    if (!Array.isArray(memberships)) {
      setMemberships([]);
    }
  }, [memberships]);

  // Show loading if user is not yet loaded
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not a customer
  if (user && !isCustomerUser(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">This page is only available for customers.</p>
        </div>
      </div>
    );
  }

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get customer ID from the authenticated user
      if (!user || !isCustomerUser(user)) {
        throw new Error('User not authenticated or not a customer.');
      }

      let customerId = user.customerId;
      
      // If customerId is not set, try to get it from the server
      if (!customerId) {
        console.log('Customer ID not found in user object, attempting to fetch from server...');
        
        try {
          const userResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.data?.user?.customerId) {
              customerId = userData.data.user.customerId;
              console.log('Retrieved customer ID from server:', customerId);
            }
          }
        } catch (fetchError) {
          console.log('Could not fetch updated user data:', fetchError);
        }
      }
      
      if (!customerId) {
        throw new Error('Customer ID not found. This usually means your account needs to be properly linked. Please contact support or try logging out and back in.');
      }

      const response = await fetch(`/api/customers/${customerId}/memberships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          // No memberships found, set empty array
          setMemberships([]);
          return;
        } else {
          throw new Error(`Failed to fetch memberships: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setMemberships(data.memberships || []);
    } catch (error) {
      console.error('Error loading memberships:', error);
      setError(error instanceof Error ? error.message : 'Failed to load memberships');
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipAction = async (membershipId: string, action: 'cancel' | 'renew' | 'delete') => {
    try {
      setLoading(true);
      
      if (!user || !isCustomerUser(user)) {
        throw new Error('User not authenticated or not a customer.');
      }

      let customerId = user.customerId;
      
      // If customerId is not set, try to get it from the server
      if (!customerId) {
        try {
          const userResponse = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.data?.user?.customerId) {
              customerId = userData.data.user.customerId;
            }
          }
        } catch (fetchError) {
          console.log('Could not fetch updated user data:', fetchError);
        }
      }
      
      if (!customerId) {
        throw new Error('Customer ID not found. This usually means your account needs to be properly linked. Please contact support or try logging out and back in.');
      }

      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'cancel':
          endpoint = `/api/customers/${customerId}/memberships/${membershipId}/cancel`;
          break;
        case 'renew':
          endpoint = `/api/customers/${customerId}/memberships/${membershipId}/renew`;
          break;
        case 'delete':
          endpoint = `/api/customers/${customerId}/memberships/${membershipId}`;
          method = 'DELETE';
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} membership: ${response.statusText}`);
      }

      // Reload memberships after successful action
      await loadMemberships();
    } catch (error) {
      console.error(`Error ${action}ing membership:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} membership`);
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

  // Ensure memberships is always an array
  const membershipsArray = Array.isArray(memberships) ? memberships : [];
  
  const filteredMemberships = membershipsArray.filter(membership => {
    const matchesSearch = membership.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || membership.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading && membershipsArray.length === 0) {
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
            <button 
              onClick={loadMemberships}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                {error.includes('Customer ID not found') && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs">
                      <strong>Solution:</strong> Try logging out and logging back in. If the problem persists, contact support.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadMemberships}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Memberships</p>
              <p className="text-2xl font-bold text-blue-600">
                {membershipsArray.filter(m => m.status === 'active').length}
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
                ${membershipsArray.filter(m => m.status === 'active').reduce((sum, m) => sum + m.monthlyFee, 0).toFixed(2)}
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
                {membershipsArray.reduce((sum, m) => sum + m.benefitsUsed, 0)}
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
                {membershipsArray.filter(m => m.status === 'active').length > 0 
                  ? new Date(membershipsArray.filter(m => m.status === 'active')[0].nextBillingDate).toLocaleDateString()
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
               {filteredMemberships.length} of {membershipsArray.length} memberships
             </span>
          </div>
        </div>
      </div>

      {/* Memberships List */}
      <div className="space-y-4">
        {filteredMemberships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                         <h3 className="text-lg font-medium text-gray-900 mb-2">
               {membershipsArray.length === 0 ? 'No memberships found' : 'No memberships match your filters'}
             </h3>
             <p className="text-gray-600 mb-6">
               {membershipsArray.length === 0 
                 ? 'Get started with a membership plan to unlock exclusive benefits.'
                 : 'Try adjusting your search or filter criteria.'
               }
             </p>
             {membershipsArray.length === 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Browse Plans</span>
              </button>
            )}
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
                  {membership.status === 'active' && (
                    <button 
                      onClick={() => handleMembershipAction(membership.id, 'cancel')}
                      className="p-2 text-yellow-400 hover:text-yellow-600 transition-colors"
                      title="Cancel Membership"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {membership.status === 'expired' && (
                    <button 
                      onClick={() => handleMembershipAction(membership.id, 'renew')}
                      className="p-2 text-green-400 hover:text-green-600 transition-colors"
                      title="Renew Membership"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {membership.status === 'cancelled' && (
                    <button 
                      onClick={() => handleMembershipAction(membership.id, 'delete')}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Membership"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Crown className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Compare Membership Plans</h2>
                  <p className="text-sm text-gray-600">Choose the perfect plan for your needs</p>
                </div>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close comparison modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <MembershipComparison 
                onSelectPlan={(plan) => {
                  setShowComparison(false);
                  // Reload memberships after selecting a new plan
                  loadMemberships();
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  All plans include our standard service guarantees
                </p>
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
