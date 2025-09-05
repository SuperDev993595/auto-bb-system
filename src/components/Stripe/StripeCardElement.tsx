import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';

interface StripeCardElementProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export const StripeCardElement: React.FC<StripeCardElementProps> = ({
  onSuccess,
  onError,
  isSubmitting,
  setIsSubmitting,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsSubmitting(false);
      onError('Card element not found');
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message || 'An error occurred while processing your card');
        onError(error.message || 'An error occurred while processing your card');
        setIsSubmitting(false);
      } else if (paymentMethod) {
        onSuccess(paymentMethod.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setCardError(errorMessage);
      onError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(event) => {
            if (event.error) {
              setCardError(event.error.message);
            } else {
              setCardError(null);
            }
          }}
        />
      </div>
      
      {cardError && (
        <div className="text-red-500 text-sm mt-2">
          {cardError}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          'Add Payment Method'
        )}
      </button>
    </form>
  );
};

export default StripeCardElement;
