import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Calculator,
  FileText,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Percent,
  TrendingUp
} from '../../utils/icons';

interface PaymentOption {
  id: string;
  name: string;
  type: 'credit_card' | 'financing' | 'installment' | 'pay_later';
  description: string;
  interestRate?: number;
  termLength?: number;
  minAmount: number;
  maxAmount: number;
  processingFee?: number;
  approvalTime: string;
  requirements: string[];
  benefits: string[];
  status: 'available' | 'pending' | 'unavailable';
}

interface AdvancedPaymentOptionsProps {
  customerId: string;
  amount: number;
  onSelectOption?: (option: PaymentOption) => void;
}

export default function AdvancedPaymentOptions({ 
  customerId, 
  amount,
  onSelectOption 
}: AdvancedPaymentOptionsProps) {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [showCalculator, setShowCalculator] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentOptions();
  }, [customerId, amount]);

  const loadPaymentOptions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOptions: PaymentOption[] = [
        {
          id: '1',
          name: 'Credit Card Payment',
          type: 'credit_card',
          description: 'Pay with your credit card for immediate processing',
          minAmount: 0,
          maxAmount: 10000,
          processingFee: 2.9,
          approvalTime: 'Instant',
          requirements: ['Valid credit card', 'Sufficient credit limit'],
          benefits: ['Immediate processing', 'Rewards points', 'Purchase protection'],
          status: 'available'
        },
        {
          id: '2',
          name: '6-Month Financing',
          type: 'financing',
          description: 'Spread your payment over 6 months with 0% APR',
          interestRate: 0,
          termLength: 6,
          minAmount: 500,
          maxAmount: 5000,
          approvalTime: '2-3 business days',
          requirements: ['Credit check', 'Income verification', 'Good credit score'],
          benefits: ['0% APR', 'No hidden fees', 'Flexible payments'],
          status: 'available'
        },
        {
          id: '3',
          name: '12-Month Financing',
          type: 'financing',
          description: 'Extended financing with competitive rates',
          interestRate: 8.99,
          termLength: 12,
          minAmount: 1000,
          maxAmount: 10000,
          approvalTime: '1-2 business days',
          requirements: ['Credit check', 'Income verification'],
          benefits: ['Lower monthly payments', 'Competitive rates', 'Quick approval'],
          status: 'available'
        },
        {
          id: '4',
          name: 'Pay in 4 Installments',
          type: 'installment',
          description: 'Split your payment into 4 equal installments',
          minAmount: 50,
          maxAmount: 2000,
          processingFee: 0,
          approvalTime: 'Instant',
          requirements: ['Valid payment method', 'No credit check'],
          benefits: ['No interest', 'No credit check', 'Instant approval'],
          status: 'available'
        },
        {
          id: '5',
          name: '30-Day Pay Later',
          type: 'pay_later',
          description: 'Pay within 30 days with no interest',
          minAmount: 100,
          maxAmount: 3000,
          approvalTime: 'Instant',
          requirements: ['Valid payment method', 'Good payment history'],
          benefits: ['No interest if paid on time', 'Flexible payment date', 'No credit impact'],
          status: 'available'
        }
      ];
      
      setPaymentOptions(mockOptions);
    } catch (error) {
      console.error('Error loading payment options:', error);
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

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    if (rate === 0) {
      return principal / months;
    }
    const monthlyRate = rate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'financing':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'installment':
        return <Calendar className="w-6 h-6 text-purple-600" />;
      case 'pay_later':
        return <Clock className="w-6 h-6 text-orange-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleDetails = (optionId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const handleOptionSelect = (option: PaymentOption) => {
    setSelectedOption(option.id);
    if (onSelectOption) {
      onSelectOption(option);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Options</h2>
          <p className="text-gray-600">Choose the payment method that works best for you</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        {paymentOptions.map((option) => (
          <div key={option.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getPaymentTypeIcon(option.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(option.status)}`}>
                    {option.status === 'available' ? 'Available' : option.status}
                  </span>
                  <button
                    onClick={() => toggleDetails(option.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showDetails[option.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {option.interestRate !== undefined && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Interest Rate</p>
                    <p className="text-sm font-medium text-gray-900">
                      {option.interestRate === 0 ? '0%' : `${option.interestRate}%`}
                    </p>
                  </div>
                )}
                {option.termLength && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Term Length</p>
                    <p className="text-sm font-medium text-gray-900">{option.termLength} months</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-500">Approval Time</p>
                  <p className="text-sm font-medium text-gray-900">{option.approvalTime}</p>
                </div>
                {option.processingFee !== undefined && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Processing Fee</p>
                    <p className="text-sm font-medium text-gray-900">
                      {option.processingFee === 0 ? 'Free' : `${option.processingFee}%`}
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly Payment Calculator */}
              {option.type === 'financing' && option.interestRate !== undefined && option.termLength && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Payment</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(calculateMonthlyPayment(amount, option.interestRate, option.termLength))}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCalculator(showCalculator === option.id ? null : option.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Calculator className="w-4 h-4" />
                      <span className="text-sm">Calculate</span>
                    </button>
                  </div>
                  
                  {showCalculator === option.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Principal</p>
                          <p className="font-medium">{formatCurrency(amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Interest</p>
                          <p className="font-medium">
                            {formatCurrency(calculateMonthlyPayment(amount, option.interestRate, option.termLength) * option.termLength - amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-medium">
                            {formatCurrency(calculateMonthlyPayment(amount, option.interestRate, option.termLength) * option.termLength)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleOptionSelect(option)}
                  disabled={option.status !== 'available'}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedOption === option.id
                      ? 'bg-blue-600 text-white'
                      : option.status === 'available'
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedOption === option.id ? 'Selected' : 'Choose Option'}
                </button>
                
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500">Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails[option.id] && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {option.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Benefits</h4>
                    <ul className="space-y-2">
                      {option.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Security */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">SSL Encrypted</p>
              <p className="text-xs text-gray-600">All transactions are secure</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">PCI Compliant</p>
              <p className="text-xs text-gray-600">Industry standard security</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Fraud Protection</p>
              <p className="text-xs text-gray-600">Advanced fraud detection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Important Information</h4>
            <ul className="mt-2 space-y-1 text-sm text-yellow-800">
              <li>• All financing options require credit approval</li>
              <li>• Late payments may result in additional fees</li>
              <li>• Terms and conditions apply to all payment options</li>
              <li>• Contact customer service for questions about payment options</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected Option Summary */}
      {selectedOption && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Selected Payment Option</h3>
          {(() => {
            const option = paymentOptions.find(o => o.id === selectedOption);
            if (!option) return null;
            
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getPaymentTypeIcon(option.type)}
                  <div>
                    <p className="text-sm font-medium text-blue-900">{option.name}</p>
                    <p className="text-sm text-blue-700">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Total Amount</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(amount)}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
