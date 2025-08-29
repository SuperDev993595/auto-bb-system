import React, { useState, useEffect } from 'react';
import { Check, X, Star, Crown, Shield, Zap, RefreshCw } from '../../utils/icons';
import api from '../../services/api';

interface MembershipPlan {
  _id: string;
  name: string;
  description?: string;
  tier: 'basic' | 'premium' | 'vip' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: Array<{
    name: string;
    description?: string;
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
  isActive: boolean;
  maxVehicles: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MembershipComparisonProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  selectedPlanId?: string;
  onCheckout?: (plan: MembershipPlan, billingCycle: 'monthly' | 'quarterly' | 'yearly') => void;
}

export default function MembershipComparison({ onSelectPlan, selectedPlanId, onCheckout }: MembershipComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>(selectedPlanId || '');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch membership plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/memberships/plans');
      // Only show active plans and sort by price (lowest first)
      const activePlans = response.data.filter((plan: MembershipPlan) => plan.isActive);
      const sortedPlans = activePlans.sort((a: MembershipPlan, b: MembershipPlan) => a.price - b.price);
      setPlans(sortedPlans);
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      setError('Failed to load membership plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'premium':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'vip':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'enterprise':
        return <Crown className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'premium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'vip':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'enterprise':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan._id);
    onSelectPlan?.(plan);
  };

  const calculatePrice = (plan: MembershipPlan) => {
    if (billingCycle === 'yearly') {
      const yearlyPrice = plan.price * 12;
      const savings = yearlyPrice * (plan.benefits.discountPercentage || 0) / 100;
      return {
        original: yearlyPrice,
        discounted: yearlyPrice - savings,
        savings: savings
      };
    } else if (billingCycle === 'quarterly') {
      const quarterlyPrice = plan.price * 3;
      const savings = quarterlyPrice * (plan.benefits.discountPercentage || 0) / 100;
      return {
        original: quarterlyPrice,
        discounted: quarterlyPrice - savings,
        savings: savings
      };
    }
    return {
      original: plan.price,
      discounted: plan.price,
      savings: 0
    };
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 'month';
      case 'quarterly':
        return 'quarter';
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
  };

  const getBillingCycleMultiplier = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return 1;
      case 'quarterly':
        return 3;
      case 'yearly':
        return 12;
      default:
        return 1;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPlans}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Show empty state
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4">No membership plans available at the moment.</p>
        <button
          onClick={fetchPlans}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('quarterly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'quarterly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Save up to {Math.max(...plans.map(p => p.benefits.discountPercentage))}%
            </span>
          </button>
        </div>
      </div>

      {/* Price Sorting Indicator */}
      <div className="text-center text-sm text-gray-600 mb-4">
        <span className="text-green-600 font-medium">✓ Plans arranged by price (lowest to highest)</span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const pricing = calculatePrice(plan);
          const isSelected = selectedPlan === plan._id;
          const isPopular = plan.tier === 'premium' || plan.tier === 'vip';
          
          return (
            <div
              key={plan._id}
              className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${isPopular ? 'ring-2 ring-blue-200' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                    {plan.tier === 'vip' ? 'VIP' : 'Popular'}
                  </span>
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute -top-3 right-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                  ${plan.price}
                </span>
              </div>

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getTierColor(plan.tier)}`}>
                    {getTierIcon(plan.tier)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="space-y-1">
                    {billingCycle !== 'monthly' && pricing.savings > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ${pricing.original.toFixed(2)}/{getBillingCycleLabel(billingCycle)}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-gray-900">
                      ${pricing.discounted.toFixed(2)}
                      <span className="text-lg font-normal text-gray-500">
                        /{getBillingCycleLabel(billingCycle)}
                      </span>
                    </div>
                    {billingCycle !== 'monthly' && pricing.savings > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Save ${pricing.savings.toFixed(2)}/{getBillingCycleLabel(billingCycle)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.filter(f => f.included).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {plan.benefits.discountPercentage > 0 && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{plan.benefits.discountPercentage}% discount on parts</span>
                      </li>
                    )}
                    {plan.benefits.priorityBooking && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Priority booking</span>
                      </li>
                    )}
                    {plan.benefits.freeInspections > 0 && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{plan.benefits.freeInspections} free inspections</span>
                      </li>
                    )}
                    {plan.benefits.roadsideAssistance && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Roadside assistance</span>
                      </li>
                    )}
                    {plan.benefits.extendedWarranty && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Extended warranty coverage</span>
                      </li>
                    )}
                    {plan.benefits.conciergeService && (
                      <li className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Concierge services</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Select/Checkout Button */}
                <button
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (isSelected && onCheckout) {
                      onCheckout(plan, billingCycle);
                    } else {
                      handlePlanSelect(plan);
                    }
                  }}
                >
                  {isSelected ? 'Subscribe Now' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan._id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Price</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      ${plan.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Max Vehicles</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.maxVehicles}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Parts Discount</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.benefits.discountPercentage}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Roadside Assistance</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.benefits.roadsideAssistance ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Priority Booking</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.benefits.priorityBooking ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Free Inspections</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.benefits.freeInspections}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
