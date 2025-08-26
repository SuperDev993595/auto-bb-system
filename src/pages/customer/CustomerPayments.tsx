import React from 'react';
import { CreditCard, DollarSign, Calendar, CheckCircle } from '../../utils/icons';

export default function CustomerPayments() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage your payment methods and view payment history</p>
        </div>
      </div>
    </div>
  );
}
