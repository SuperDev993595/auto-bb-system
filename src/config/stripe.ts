// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here',
  currency: 'usd',
  supportedCountries: ['US', 'CA', 'GB', 'AU'],
  supportedCurrencies: ['usd', 'cad', 'gbp', 'aud']
};

// Validate Stripe configuration
export const validateStripeConfig = () => {
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not found. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.');
    return false;
  }
  return true;
};

// Get Stripe publishable key with validation
export const getStripePublishableKey = () => {
  if (!validateStripeConfig()) {
    throw new Error('Stripe configuration is invalid. Please check your environment variables.');
  }
  return STRIPE_CONFIG.publishableKey;
};
