import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { recordPayment } from '../../redux/actions/collections';
import { CollectionsTask, PaymentPlanUpdateData } from '../../services/collections';
import { X, DollarSign, Calendar, CheckCircle } from '../../utils/icons';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CollectionsTask;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (!task.paymentPlan) {
      toast.error('No payment plan found for this task');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const remainingBalance = task.paymentPlan.totalAmount - task.paymentPlan.totalPaid;
    
    if (amount > remainingBalance) {
      toast.error(`Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData: PaymentPlanUpdateData = { paymentAmount: amount };
      await dispatch(recordPayment({ id: task._id, data: paymentData })).unwrap();
      toast.success('Payment recorded successfully');
      onClose();
      setPaymentAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task.paymentPlan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const remainingBalance = task.paymentPlan.totalAmount - task.paymentPlan.totalPaid;
  const nextPaymentDate = task.paymentPlan.nextPaymentDate ? new Date(task.paymentPlan.nextPaymentDate) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Task: {task.title} - {typeof task.customer === 'object' ? task.customer.businessName || task.customer.name : 'Unknown'}
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Payment Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Payment Plan Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(task.paymentPlan.totalAmount)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(task.paymentPlan.totalPaid)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(remainingBalance)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Payments Made</p>
                <p className="text-lg font-semibold text-gray-900">
                  {task.paymentPlan.paymentsMade} / {task.paymentPlan.numberOfInstallments}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Installment Amount</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(task.paymentPlan.installmentAmount)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Installment Frequency</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {task.paymentPlan.installmentFrequency.replace('-', ' ')}
                </p>
              </div>
            </div>

            {nextPaymentDate && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Next Payment Date</p>
                <p className="text-lg font-semibold text-blue-600">
                  {nextPaymentDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum payment: {formatCurrency(remainingBalance)}
              </p>
            </div>

            {/* Payment Preview */}
            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Payment Preview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Current Balance:</span>
                    <span className="text-sm font-medium text-blue-900">{formatCurrency(remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Payment Amount:</span>
                    <span className="text-sm font-medium text-blue-900">-{formatCurrency(parseFloat(paymentAmount))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-blue-900">New Balance:</span>
                    <span className="text-sm font-bold text-blue-900">
                      {formatCurrency(remainingBalance - parseFloat(paymentAmount))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
