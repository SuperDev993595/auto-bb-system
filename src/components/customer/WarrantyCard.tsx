import React from 'react';
import { 
  Shield, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Car,
  Gauge,
  DollarSign,
  FileText
} from '../../utils/icons';
import { Warranty } from '../../services/warranties';

interface WarrantyCardProps {
  warranty: Warranty;
  onViewDetails?: (warranty: Warranty) => void;
  onUpdateMileage?: (warranty: Warranty) => void;
  onFileClaim?: (warranty: Warranty) => void;
  showActions?: boolean;
}

export default function WarrantyCard({ 
  warranty, 
  onViewDetails, 
  onUpdateMileage, 
  onFileClaim, 
  showActions = true 
}: WarrantyCardProps) {
  // Handle undefined warranty
  if (!warranty) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>No warranty data available</p>
        </div>
      </div>
    );
  }
  const getStatusIcon = () => {
    const status = warranty.status || 'unknown';
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'suspended':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    const status = warranty.status || 'unknown';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWarrantyTypeIcon = () => {
    const warrantyType = warranty.warrantyType || 'unknown';
    switch (warrantyType) {
      case 'manufacturer':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'extended':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'powertrain':
        return <Car className="w-5 h-5 text-green-600" />;
      case 'bumper_to_bumper':
        return <Shield className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
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

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const isExpiringSoon = () => {
    const status = warranty.status || 'unknown';
    if (status !== 'active') return false;
    const daysUntilExpiration = warranty.daysUntilExpiration || 0;
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0;
  };

  const isMileageExpiring = () => {
    const status = warranty.status || 'unknown';
    if (status !== 'active' || !warranty.mileageLimit || !warranty.mileageRemaining) return false;
    const remainingPercentage = (warranty.mileageRemaining / warranty.mileageLimit) * 100;
    return remainingPercentage <= 10 && remainingPercentage > 0;
  };

  const getCoverageSummary = () => {
    if (!warranty.coverage) return 'Coverage details not available';
    
    const coverageItems = Object.entries(warranty.coverage)
      .filter(([_, covered]) => covered)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1));
    
    return coverageItems.length > 0 
      ? coverageItems.slice(0, 3).join(', ') + (coverageItems.length > 3 ? '...' : '')
      : 'No specific coverage details available';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getWarrantyTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {warranty.name || 'Unnamed Warranty'}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {warranty.warrantyType?.replace('_', ' ') || 'Unknown'} Warranty
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
              {warranty.status || 'unknown'}
            </span>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Car className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {warranty.vehicle?.year || 'N/A'} {warranty.vehicle?.make || 'N/A'} {warranty.vehicle?.model || 'N/A'}
          </span>
        </div>
        <div className="text-xs text-blue-700">
          VIN: {warranty.vehicle?.vin || 'N/A'}
        </div>
      </div>

      {/* Expiration Warnings */}
      {isExpiringSoon() && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Expires in {warranty.daysUntilExpiration || 0} days
            </span>
          </div>
        </div>
      )}

      {isMileageExpiring() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {formatMileage(warranty.mileageRemaining || 0)} miles remaining
            </span>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-medium text-gray-900">
            {warranty.startDate ? formatDate(warranty.startDate) : 'Not set'}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">End Date:</span>
          <span className="font-medium text-gray-900">
            {warranty.endDate ? formatDate(warranty.endDate) : 'Not set'}
          </span>
        </div>

        {warranty.mileageLimit && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mileage Limit:</span>
            <span className="font-medium text-gray-900">
              {formatMileage(warranty.mileageLimit || 0)} miles
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Mileage:</span>
          <span className="font-medium text-gray-900">
            {formatMileage(warranty.currentMileage || 0)} miles
          </span>
        </div>

        {(warranty.deductible || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Deductible:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(warranty.deductible || 0)}
            </span>
          </div>
        )}

        {warranty.maxClaimAmount && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Max Claim:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(warranty.maxClaimAmount || 0)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Claims:</span>
          <span className="font-medium text-gray-900">
            {warranty.totalClaims || 0} (${formatCurrency(warranty.totalClaimAmount || 0)})
          </span>
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage Includes</h4>
        <p className="text-xs text-gray-600">
          {getCoverageSummary()}
        </p>
      </div>

      {/* Provider Info */}
      {warranty.provider?.name && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-1">Provider</h4>
          <p className="text-xs text-green-700">{warranty.provider.name}</p>
          {warranty.provider.contact?.phone && (
            <p className="text-xs text-green-700">{warranty.provider.contact.phone}</p>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(warranty)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </button>
          )}
          {onUpdateMileage && (warranty.status || 'unknown') === 'active' && (
            <button
              onClick={() => onUpdateMileage(warranty)}
              className="flex-1 py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              Update Mileage
            </button>
          )}
          {onFileClaim && (warranty.status || 'unknown') === 'active' && (
            <button
              onClick={() => onFileClaim(warranty)}
              className="flex-1 py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
            >
              File Claim
            </button>
          )}
        </div>
      )}
    </div>
  );
}
