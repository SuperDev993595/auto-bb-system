// Check if Stripe API key is provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables. Stripe payments will be disabled.');
  console.warn('   To enable Stripe payments, add STRIPE_SECRET_KEY to your .env file');
  console.warn('   Example: STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here');
  
  // Export a mock Stripe instance for development
  const mockStripe = {
    paymentIntents: {
      create: async () => {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
      },
      retrieve: async () => {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
      }
    },
    customers: {
      create: async () => {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
      }
    },
    paymentMethods: {
      list: async () => {
        throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
      }
    }
  };
  
  module.exports = mockStripe;
} else {
  // Initialize Stripe with the provided API key
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
  module.exports = stripe;
}
