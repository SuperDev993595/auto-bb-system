import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customers';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  Gift, 
  Award, 
  Crown,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  Wrench,
  Phone,
  Users,
  Car,
  TrendingUp,
  MapPin,
  FileText,
  Heart,
  Target
} from '../../utils/icons';

interface Membership {
  _id: string;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  autoRenew: boolean;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'overdue';
  totalPaid: number;
  benefitsUsed: {
    inspections: number;
    roadsideAssistance: number;
    priorityBookings: number;
  };
  membershipPlan: {
    _id: string;
    name: string;
    description: string;
    tier: 'basic' | 'premium' | 'vip' | 'enterprise';
    features: Array<{
      name: string;
      description: string;
      included: boolean;
    }>;
    benefits: {
      discountPercentage: number;
      priorityBooking: boolean;
      freeInspections: number;
      roadsideAssistance: boolean;
      extendedWarranty: boolean;
      conciergeService: boolean;
    };
  };
  createdAt: string;
}

interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  tier: 'basic' | 'premium' | 'vip' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: Array<{
    name: string;
    description: string;
    included: boolean;
  }>;
  benefits: {
    discountPercentage: number;
    priorityBooking: boolean;
    freeInspections: number;
    roadsideAssistance: boolean;
    extendedWarranty: boolean;
    conciergeService: boolean;
  };
}

interface RewardsStats {
  totalMemberships: number;
  activeMemberships: number;
  totalSavings: number;
  totalBenefitsUsed: number;
  nextRenewalDate?: string;
  availableDiscounts: number;
}

export default function CustomerRewards() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [availablePlans, setAvailablePlans] = useState<MembershipPlan[]>([]);
  const [stats, setStats] = useState<RewardsStats>({
    totalMemberships: 0,
    activeMemberships: 0,
    totalSavings: 0,
    totalBenefitsUsed: 0,
    availableDiscounts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMembership, setExpandedMembership] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" /> },
      suspended: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
      expired: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get tier badge
  const getTierBadge = (tier: string) => {
    const tierConfig = {
      basic: { color: 'bg-blue-100 text-blue-800', icon: <Star className="w-4 h-4" /> },
      premium: { color: 'bg-purple-100 text-purple-800', icon: <Crown className="w-4 h-4" /> },
      vip: { color: 'bg-yellow-100 text-yellow-800', icon: <Award className="w-4 h-4" /> },
      enterprise: { color: 'bg-indigo-100 text-indigo-800', icon: <Award className="w-4 h-4" /> }
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate stats
  const calculateStats = (memberships: Membership[]) => {
    if (memberships.length === 0) return stats;

    const activeMemberships = memberships.filter(m => m.status === 'active');
    const totalSavings = memberships.reduce((sum, m) => {
      const discountAmount = (m.totalPaid * m.membershipPlan.benefits.discountPercentage) / 100;
      return sum + discountAmount;
    }, 0);
    
    const totalBenefitsUsed = memberships.reduce((sum, m) => {
      return sum + m.benefitsUsed.inspections + m.benefitsUsed.roadsideAssistance + m.benefitsUsed.priorityBookings;
    }, 0);

    const nextRenewalDate = activeMemberships
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())[0]?.nextBillingDate;

    const availableDiscounts = activeMemberships.reduce((sum, m) => {
      return sum + m.membershipPlan.benefits.discountPercentage;
    }, 0);

    return {
      totalMemberships: memberships.length,
      activeMemberships: activeMemberships.length,
      totalSavings,
      totalBenefitsUsed,
      nextRenewalDate,
      availableDiscounts
    };
  };

  // Get benefit icon
  const getBenefitIcon = (benefitName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Priority Booking': <Clock className="w-4 h-4" />,
      'Free Inspections': <Shield className="w-4 h-4" />,
      'Roadside Assistance': <Truck className="w-4 h-4" />,
      'Extended Warranty': <Shield className="w-4 h-4" />,
      'Concierge Service': <Phone className="w-4 h-4" />,
             'Discount': <DollarSign className="w-4 h-4" />
    };
    return iconMap[benefitName] || <Star className="w-4 h-4" />;
  };

  // Load rewards data
  const loadRewardsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerService.getCustomerRewards();
      
      if (response.success) {
        setMemberships(response.data.memberships);
        setAvailablePlans(response.data.availablePlans);
        setStats(calculateStats(response.data.memberships));
      } else {
        setError('Failed to load rewards data');
        toast.error('Failed to load rewards data');
      }
    } catch (err) {
      console.error('Error loading rewards data:', err);
      setError('An error occurred while loading rewards data');
      toast.error('An error occurred while loading rewards data');
    } finally {
      setIsLoading(false);
    }
  };

  // Upgrade membership
  const upgradeMembership = async (planId: string) => {
    try {
      // In a real implementation, this would integrate with payment processing
      toast.success('Membership upgrade initiated');
      await loadRewardsData(); // Refresh data
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    } catch (err) {
      toast.error('Failed to upgrade membership');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadRewardsData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Rewards Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadRewardsData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rewards & Memberships</h1>
              <p className="text-gray-600">View your loyalty points, rewards, and membership benefits</p>
            </div>
            <div className="flex gap-3">
                             <button
                 onClick={() => setShowUpgradeModal(true)}
                 className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
               >
                 <Zap className="w-4 h-4" />
                 Upgrade Membership
               </button>
              <button
                onClick={loadRewardsData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
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
                <p className="text-2xl font-bold text-gray-900">{stats.activeMemberships}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSavings)}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats.totalBenefitsUsed}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Discounts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.availableDiscounts}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Memberships */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Memberships ({memberships.length})
            </h3>
          </div>

          {memberships.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Memberships Yet</h3>
              <p className="text-gray-600 mb-4">Join a membership plan to unlock exclusive benefits and rewards</p>
                             <button
                 onClick={() => setShowUpgradeModal(true)}
                 className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
               >
                 <Zap className="w-4 h-4" />
                 Browse Plans
               </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {memberships.map((membership) => (
                <div key={membership._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{membership.membershipPlan.name}</h4>
                          {getStatusBadge(membership.status)}
                          {getTierBadge(membership.membershipPlan.tier)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{membership.membershipPlan.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Started: {formatDate(membership.startDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Next Billing: {formatDate(membership.nextBillingDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-semibold">{formatCurrency(membership.price)}/{membership.billingCycle}</span>
                          </div>

                                                     <div className="flex items-center gap-2">
                             <DollarSign className="w-4 h-4 text-gray-400" />
                             <span className="text-gray-600">{membership.membershipPlan.benefits.discountPercentage}% Discount</span>
                           </div>
                        </div>

                        {expandedMembership === membership._id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Benefits */}
                              <div>
                                <h5 className="font-medium text-gray-700 mb-3">Available Benefits</h5>
                                <div className="space-y-2">
                                                                     {membership.membershipPlan.benefits.priorityBooking && (
                                     <div className="flex items-center gap-2 text-sm">
                                       <Clock className="w-4 h-4 text-green-600" />
                                       <span className="text-gray-600">Priority Booking</span>
                                     </div>
                                   )}
                                                                     {membership.membershipPlan.benefits.freeInspections > 0 && (
                                     <div className="flex items-center gap-2 text-sm">
                                       <Shield className="w-4 h-4 text-green-600" />
                                       <span className="text-gray-600">{membership.membershipPlan.benefits.freeInspections} Free Inspections</span>
                                     </div>
                                   )}
                                  {membership.membershipPlan.benefits.roadsideAssistance && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Truck className="w-4 h-4 text-green-600" />
                                      <span className="text-gray-600">Roadside Assistance</span>
                                    </div>
                                  )}
                                  {membership.membershipPlan.benefits.extendedWarranty && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Shield className="w-4 h-4 text-green-600" />
                                      <span className="text-gray-600">Extended Warranty</span>
                                    </div>
                                  )}
                                  {membership.membershipPlan.benefits.conciergeService && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="w-4 h-4 text-green-600" />
                                      <span className="text-gray-600">Concierge Service</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Usage */}
                              <div>
                                <h5 className="font-medium text-gray-700 mb-3">Benefits Used</h5>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Inspections</span>
                                    <span className="font-medium">{membership.benefitsUsed.inspections}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Roadside Assistance</span>
                                    <span className="font-medium">{membership.benefitsUsed.roadsideAssistance}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Priority Bookings</span>
                                    <span className="font-medium">{membership.benefitsUsed.priorityBookings}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setExpandedMembership(
                          expandedMembership === membership._id ? null : membership._id
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedMembership === membership._id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              View All Plans
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.slice(0, 3).map((plan) => (
              <div key={plan._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {getTierBadge(plan.tier)}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(plan.price)}</p>
                    <p className="text-sm text-gray-600">per {plan.billingCycle}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="space-y-2 mb-6">
                  {plan.benefits.discountPercentage > 0 && (
                                         <div className="flex items-center gap-2 text-sm">
                       <DollarSign className="w-4 h-4 text-green-600" />
                       <span className="text-gray-600">{plan.benefits.discountPercentage}% Service Discount</span>
                     </div>
                  )}
                                     {plan.benefits.priorityBooking && (
                     <div className="flex items-center gap-2 text-sm">
                       <Clock className="w-4 h-4 text-green-600" />
                       <span className="text-gray-600">Priority Booking</span>
                     </div>
                   )}
                   {plan.benefits.freeInspections > 0 && (
                     <div className="flex items-center gap-2 text-sm">
                       <Shield className="w-4 h-4 text-green-600" />
                       <span className="text-gray-600">{plan.benefits.freeInspections} Free Inspections</span>
                     </div>
                   )}
                </div>
                
                                 <button
                   onClick={() => {
                     setSelectedPlan(plan);
                     setShowUpgradeModal(true);
                   }}
                   className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                 >
                   <Zap className="w-4 h-4" />
                   Upgrade to {plan.name}
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upgrade Membership</h3>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSelectedPlan(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedPlan ? (
                <div>
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedPlan.name}</h4>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Plan Benefits</h5>
                      <div className="space-y-2">
                        {selectedPlan.benefits.discountPercentage > 0 && (
                                                     <div className="flex items-center gap-2 text-sm">
                             <DollarSign className="w-4 h-4 text-green-600" />
                             <span className="text-gray-600">{selectedPlan.benefits.discountPercentage}% Service Discount</span>
                           </div>
                        )}
                                                 {selectedPlan.benefits.priorityBooking && (
                           <div className="flex items-center gap-2 text-sm">
                             <Clock className="w-4 h-4 text-green-600" />
                             <span className="text-gray-600">Priority Booking</span>
                           </div>
                         )}
                         {selectedPlan.benefits.freeInspections > 0 && (
                           <div className="flex items-center gap-2 text-sm">
                             <Shield className="w-4 h-4 text-green-600" />
                             <span className="text-gray-600">{selectedPlan.benefits.freeInspections} Free Inspections</span>
                           </div>
                         )}
                        {selectedPlan.benefits.roadsideAssistance && (
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Roadside Assistance</span>
                          </div>
                        )}
                        {selectedPlan.benefits.extendedWarranty && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Extended Warranty</span>
                          </div>
                        )}
                        {selectedPlan.benefits.conciergeService && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Concierge Service</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Pricing</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Monthly Price</span>
                          <span className="font-semibold">{formatCurrency(selectedPlan.price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Billing Cycle</span>
                          <span className="font-semibold capitalize">{selectedPlan.billingCycle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Auto-Renew</span>
                          <span className="font-semibold text-green-600">Yes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                                         <button
                       onClick={() => upgradeMembership(selectedPlan._id)}
                       className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                     >
                       <Zap className="w-4 h-4" />
                       Upgrade Now
                     </button>
                    <button
                      onClick={() => {
                        setShowUpgradeModal(false);
                        setSelectedPlan(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose a Plan</h4>
                  <p className="text-gray-600 mb-6">Select a membership plan to see detailed benefits and pricing</p>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
