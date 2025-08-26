import React from 'react';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Shield
} from '../../utils/icons';
import { CustomerMembership } from '../../services/memberships';

interface MembershipCardProps {
  membership: CustomerMembership;
  onManage?: (membership: CustomerMembership) => void;
  onCancel?: (membership: CustomerMembership) => void;
  showActions?: boolean;
}

export default function MembershipCard({ 
  membership, 
  onManage, 
  onCancel, 
  showActions = true 
}: MembershipCardProps) {
  // Handle undefined membership
  if (!membership) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>No membership data available</p>
        </div>
      </div>
    );
  }
  const getStatusIcon = () => {
    switch (membership.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'suspended':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (membership.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = () => {
    const tier = membership?.membershipPlan?.tier || 'basic';
    switch (tier) {
      case 'vip':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'enterprise':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'premium':
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isExpiringSoon = () => {
    if (membership.status !== 'active') return false;
    const daysUntilRenewal = membership.daysUntilRenewal || 0;
    return daysUntilRenewal <= 30 && daysUntilRenewal > 0;
  };

  const isExpired = () => {
    return membership.status === 'expired' || membership.isExpired || false;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTierIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {membership?.membershipPlan?.name || 'Membership Plan'}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {membership?.membershipPlan?.tier || 'basic'} Tier
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
            {membership.status}
          </span>
        </div>
      </div>

      {/* Expiration Warning */}
      {isExpiringSoon() && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Expires in {membership.daysUntilRenewal} days
            </span>
          </div>
        </div>
      )}

      {isExpired() && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Membership expired
            </span>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(membership.price)}/{membership.billingCycle}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Next Billing:</span>
          <span className="font-medium text-gray-900">
            {membership.nextBillingDate ? formatDate(membership.nextBillingDate) : 'Not set'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-medium text-gray-900">
            {membership.startDate ? formatDate(membership.startDate) : 'Not set'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End Date:</span>
          <span className="font-medium text-gray-900">
            {membership.endDate ? formatDate(membership.endDate) : 'Not set'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium text-gray-900 capitalize">
            {membership.paymentMethod?.replace('_', ' ') || 'Not set'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Auto Renew:</span>
          <span className={`font-medium ${membership.autoRenew ? 'text-green-600' : 'text-red-600'}`}>
            {membership.autoRenew ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Paid:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(membership.totalPaid || 0)}
          </span>
        </div>
      </div>

      {/* Benefits Used */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits Used</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-blue-600">{membership.benefitsUsed?.inspections || 0}</div>
            <div className="text-gray-600">Inspections</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{membership.benefitsUsed?.roadsideAssistance || 0}</div>
            <div className="text-gray-600">Roadside</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{membership.benefitsUsed?.priorityBookings || 0}</div>
            <div className="text-gray-600">Priority</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {onManage && (
            <button
              onClick={() => onManage(membership)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Manage Plan
            </button>
          )}
          {onCancel && membership.status === 'active' && (
            <button
              onClick={() => onCancel(membership)}
              className="flex-1 py-2 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
