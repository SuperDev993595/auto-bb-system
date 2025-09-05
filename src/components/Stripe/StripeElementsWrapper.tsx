import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { STRIPE_CONFIG } from '../../config/stripe';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface StripeElementsWrapperProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export const StripeElementsWrapper: React.FC<StripeElementsWrapperProps> = ({ 
  children, 
  clientSecret 
}) => {
  const options = {
    // For payment methods, we don't need clientSecret
    // For payment intents, we would pass clientSecret
    ...(clientSecret && { clientSecret }),
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeElementsWrapper;
