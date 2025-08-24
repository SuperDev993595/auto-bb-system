import React from 'react';
import { HiCurrencyDollar } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';
import { Invoice } from '../../utils/CustomerTypes';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  onConfirm: (invoiceId: string) => void;
  isLoading?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  invoice,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  isLoading = false
}: PaymentModalProps) {
  if (!invoice) return null;

  const amountDue = invoice.total - (invoice.paidAmount || 0);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      icon={<HiCurrencyDollar className="w-5 h-5" />}
      submitText={isLoading ? 'Recording...' : 'Record Payment'}
      onSubmit={() => onConfirm(invoice._id)}
      submitColor="bg-blue-600"
    >
      <div className="p-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-gray-600">Invoice: #{invoice.invoiceNumber}</p>
          <p className="text-sm text-gray-600">Customer: {invoice.customer?.name}</p>
          <p className="text-sm font-medium text-gray-900">Amount Due: ${amountDue.toFixed(2)}</p>
        </div>
        
        <div>
          <label className="form-label">Payment Amount</label>
          <input
            type="number"
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="form-input"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="form-label">Payment Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-select"
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>
    </ModalWrapper>
  );
}
