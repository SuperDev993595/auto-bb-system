import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Users, 
  Shield,
  Star,
  DollarSign,
  Calendar,
  Zap,
  Car,
  Phone,
  FileText
} from 'lucide-react';
import { MembershipPlan } from '../../services/memberships';
import { membershipService } from '../../services/memberships';

interface MembershipComparisonProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  showActions?: boolean;
}

export default function MembershipComparison({ 
  onSelectPlan, 
  showActions = true 
}: MembershipComparisonProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadMembershipPlans();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      setLoading(true);
      const membershipPlans = await membershipService.getMembershipPlans();
      setPlans(membershipPlans);
    } catch (error) {
      console.error('Error loading membership plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'enterprise':
        return <Shield className="w-6 h-6 text-purple-600" />;
      case 'premium':
        return <Star className="w-6 h-6 text-blue-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'border-yellow-500 bg-yellow-50';
      case 'enterprise':
        return 'border-purple-500 bg-purple-50';
      case 'premium':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatBillingCycle = (cycle: string) => {
    return cycle.charAt(0).toUpperCase() + cycle.slice(1);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p._id === planId);
    if (plan && onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  const getFeatureIcon = (included: boolean) => {
    return included ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No membership plans available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Membership Plan
        </h2>
        <p className="text-gray-600">
          Compare our membership tiers and find the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`relative rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
              selectedPlan === plan._id 
                ? 'border-blue-500 shadow-lg scale-105' 
                : getTierColor(plan.tier)
            }`}
          >
            {/* Popular Badge */}
            {plan.tier === 'premium' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                {getTierIcon(plan.tier)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 capitalize mb-4">
                {plan.tier} Tier
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-gray-600">/{formatBillingCycle(plan.billingCycle)}</span>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {plan.description}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
              
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Discount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {plan.benefits.discountPercentage}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Priority Booking</span>
                  {getFeatureIcon(plan.benefits.priorityBooking)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Free Inspections</span>
                  <span className="text-sm font-medium text-gray-900">
                    {plan.benefits.freeInspections}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Roadside Assistance</span>
                  {getFeatureIcon(plan.benefits.roadsideAssistance)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Extended Warranty</span>
                  {getFeatureIcon(plan.benefits.extendedWarranty)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Concierge Service</span>
                  {getFeatureIcon(plan.benefits.conciergeService)}
                </div>
              </div>

              {/* Additional Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Additional Features</h5>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{feature.name}</span>
                        {getFeatureIcon(feature.included)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Limit */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Car className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Up to {plan.maxVehicles} vehicles
                </span>
              </div>
            </div>

            {/* Action Button */}
            {showActions && (
              <button
                onClick={() => handlePlanSelect(plan._id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  selectedPlan === plan._id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {selectedPlan === plan._id ? 'Selected' : 'Choose Plan'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Detailed Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th key={plan._id} className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Service Discount
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {plan.benefits.discountPercentage}%
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Priority Booking
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {getFeatureIcon(plan.benefits.priorityBooking)}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Free Inspections
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {plan.benefits.freeInspections}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Roadside Assistance
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {getFeatureIcon(plan.benefits.roadsideAssistance)}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Extended Warranty
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {getFeatureIcon(plan.benefits.extendedWarranty)}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Concierge Service
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {getFeatureIcon(plan.benefits.conciergeService)}
                  </td>
                ))}
              </tr>
              <tr className="bg-white">
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                  Max Vehicles
                </td>
                {plans.map((plan) => (
                  <td key={plan._id} className="border border-gray-200 px-4 py-3 text-center">
                    {plan.maxVehicles}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
