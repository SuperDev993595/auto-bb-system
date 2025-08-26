import React, { useState } from 'react';
import { Check, X, Star, Crown, Shield, Zap } from '../../../utils/icons';

interface MembershipPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'elite';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  benefits: string[];
  popular?: boolean;
  savings?: number;
}

interface MembershipComparisonProps {
  onSelectPlan?: (plan: MembershipPlan) => void;
  selectedPlanId?: string;
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Basic Membership',
    tier: 'basic',
    price: 19.99,
    billingCycle: 'monthly',
    features: [
      'Free oil changes',
      '10% off parts',
      'Basic roadside assistance',
      'Service reminders',
      'Online appointment booking'
    ],
    benefits: [
      'Up to 2 vehicles',
      'Standard customer support',
      'Basic reporting'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Membership',
    tier: 'premium',
    price: 49.99,
    billingCycle: 'monthly',
    features: [
      'All Basic features',
      'Free tire rotations',
      '20% off parts',
      'Priority scheduling',
      'Extended roadside assistance',
      'Vehicle health reports',
      'Concierge service'
    ],
    benefits: [
      'Up to 5 vehicles',
      'Priority customer support',
      'Advanced analytics',
      'Exclusive promotions'
    ],
    popular: true,
    savings: 15
  },
  {
    id: 'elite',
    name: 'Elite Membership',
    tier: 'elite',
    price: 99.99,
    billingCycle: 'monthly',
    features: [
      'All Premium features',
      'Free comprehensive inspections',
      '30% off parts',
      'VIP scheduling',
      'Unlimited roadside assistance',
      'Real-time vehicle monitoring',
      'Personal service advisor',
      'Loaner vehicle priority',
      'Mobile service calls'
    ],
    benefits: [
      'Unlimited vehicles',
      '24/7 VIP support',
      'Custom reporting',
      'Exclusive events',
      'Partner discounts'
    ],
    savings: 25
  }
];

export default function MembershipComparison({ onSelectPlan, selectedPlanId }: MembershipComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>(selectedPlanId || '');

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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'premium':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'elite':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan.id);
    onSelectPlan?.(plan);
  };

  const calculatePrice = (plan: MembershipPlan) => {
    if (billingCycle === 'yearly') {
      const yearlyPrice = plan.price * 12;
      const savings = yearlyPrice * (plan.savings || 0) / 100;
      return {
        original: yearlyPrice,
        discounted: yearlyPrice - savings,
        savings: savings
      };
    }
    return {
      original: plan.price,
      discounted: plan.price,
      savings: 0
    };
  };

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
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipPlans.map((plan) => {
          const pricing = calculatePrice(plan);
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${plan.popular ? 'ring-2 ring-blue-200' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getTierColor(plan.tier)}`}>
                    {getTierIcon(plan.tier)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="space-y-1">
                    {billingCycle === 'yearly' && pricing.savings > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        ${pricing.original.toFixed(2)}/year
                      </div>
                    )}
                    <div className="text-3xl font-bold text-gray-900">
                      ${billingCycle === 'yearly' ? pricing.discounted.toFixed(2) : pricing.discounted.toFixed(2)}
                      <span className="text-lg font-normal text-gray-500">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && pricing.savings > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Save ${pricing.savings.toFixed(2)}/year
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button */}
                <button
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
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
                  {membershipPlans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Price</td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-sm text-center text-gray-700">
                      ${plan.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Max Vehicles</td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.tier === 'basic' ? '2' : plan.tier === 'premium' ? '5' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Parts Discount</td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.tier === 'basic' ? '10%' : plan.tier === 'premium' ? '20%' : '30%'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Roadside Assistance</td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.tier === 'basic' ? 'Basic' : plan.tier === 'premium' ? 'Extended' : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Customer Support</td>
                  {membershipPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-sm text-center text-gray-700">
                      {plan.tier === 'basic' ? 'Standard' : plan.tier === 'premium' ? 'Priority' : '24/7 VIP'}
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
