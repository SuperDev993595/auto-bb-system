import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/payments';
import { membershipService } from '../../services/memberships';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign
} from '../../utils/icons';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface MembershipCheckoutProps {
  selectedPlan: any;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  onSuccess: (membership: any) => void;
  onCancel: () => void;
}

interface CheckoutFormProps {
  selectedPlan: any;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  onSuccess: (membership: any) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  selectedPlan, 
  billingCycle, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  useEffect(() => {
    createPaymentIntent();
  }, [selectedPlan, billingCycle]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const intent = await paymentService.createPaymentIntent(
        selectedPlan._id,
        billingCycle
      );
      setPaymentIntent(intent);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    
    switch (billingCycle) {
      case 'monthly':
        return selectedPlan.price;
      case 'quarterly':
        return selectedPlan.price * 3;
      case 'yearly':
        return selectedPlan.price * 12;
      default:
        return selectedPlan.price;
    }
  };

  const getBillingCycleLabel = () => {
    switch (billingCycle) {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (error) {
        toast.error(error.message || 'Payment failed');
        return;
      }

      if (confirmedIntent.status === 'succeeded') {
        // Confirm membership creation
        const membership = await paymentService.confirmMembership(
          confirmedIntent.id,
          selectedPlan._id,
          billingCycle,
          autoRenew
        );

        if (membership.success) {
          toast.success('Membership activated successfully!');
          onSuccess(membership.membership);
        } else {
          toast.error(membership.message || 'Failed to create membership');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (loading && !paymentIntent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-gray-600">Initializing payment...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Plan Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedPlan.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ${calculatePrice().toFixed(2)}
            </span>
            <span className="text-gray-600">per {getBillingCycleLabel()}</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Billing cycle: {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Auto-renewal Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Auto-renewal
              </label>
              <p className="text-xs text-gray-500">
                Automatically renew your membership
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoRenew(!autoRenew)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRenew ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  autoRenew ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Secure Payment</p>
              <p>Your payment information is encrypted and secure.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${calculatePrice().toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MembershipCheckout: React.FC<MembershipCheckoutProps> = ({
  selectedPlan,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Membership
          </h1>
          <p className="text-gray-600">
            Secure payment powered by Stripe
          </p>
        </div>

        {/* Checkout Form */}
        <Elements stripe={stripePromise}>
          <CheckoutForm
            selectedPlan={selectedPlan}
            billingCycle={billingCycle}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>
    </div>
  );
};

export default MembershipCheckout;
