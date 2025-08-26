import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Upload
} from '../../utils/icons';
import { Warranty } from '../../services/warranties';
import { warrantyService } from '../../services/warranties';
import ModalWrapper from '../../utils/ModalWrapper';

interface WarrantyClaimFormProps {
  warranty: Warranty;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (claimData: any) => void;
}

export default function WarrantyClaimForm({ 
  warranty, 
  isOpen, 
  onClose, 
  onSubmit 
}: WarrantyClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimDescription, setClaimDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!claimAmount || claimAmount <= 0) {
      newErrors.claimAmount = 'Claim amount is required and must be greater than 0';
    }
    if (!claimDescription.trim()) {
      newErrors.claimDescription = 'Claim description is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      
      const updatedWarranty = await warrantyService.addWarrantyClaim(
        warranty._id,
        claimAmount,
        claimDescription
      );

      if (onSubmit) {
        onSubmit({ claimAmount, claimDescription });
      }

      onClose();
      setClaimAmount(0);
      setClaimDescription('');
    } catch (error) {
      console.error('Error submitting warranty claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`File Warranty Claim - ${warranty.name}`}
      icon={<Shield className="w-5 h-5" />}
      submitText="Submit Claim"
      onSubmit={handleSubmit}
      submitColor="bg-green-600"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Warranty Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Warranty Information</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><span className="font-medium">Vehicle:</span> {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}</p>
            <p><span className="font-medium">Type:</span> {warranty.warrantyType.replace('_', ' ')}</p>
            <p><span className="font-medium">Status:</span> {warranty.status}</p>
            {warranty.maxClaimAmount && (
              <p><span className="font-medium">Max Claim Amount:</span> {formatCurrency(warranty.maxClaimAmount)}</p>
            )}
          </div>
        </div>

        {/* Claim Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Claim Amount *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(parseFloat(e.target.value) || 0)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.claimAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {errors.claimAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.claimAmount}</p>
          )}
        </div>

        {/* Claim Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Claim Description *
          </label>
          <textarea
            value={claimDescription}
            onChange={(e) => setClaimDescription(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.claimDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Describe the issue or damage that occurred..."
          />
          {errors.claimDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.claimDescription}</p>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Important</span>
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            By submitting this claim, you agree that all information provided is accurate and complete. 
            Our team will review your claim and contact you within 2-3 business days.
          </p>
        </div>
      </div>
    </ModalWrapper>
  );
}
