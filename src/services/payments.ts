import api from './api';

export interface PaymentIntent {
  success: boolean;
  clientSecret: string;
  amount: number;
  membershipPlan: {
    _id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface MembershipConfirmation {
  success: boolean;
  message: string;
  membership: any;
}

class PaymentService {
  // Create payment intent for membership
  async createPaymentIntent(membershipPlanId: string, billingCycle: string): Promise<PaymentIntent> {
    const response = await api.post('/payments/create-payment-intent', {
      membershipPlanId,
      billingCycle
    });
    return response.data;
  }

  // Confirm membership after payment
  async confirmMembership(
    paymentIntentId: string, 
    membershipPlanId: string, 
    billingCycle: string, 
    autoRenew: boolean = true
  ): Promise<MembershipConfirmation> {
    const response = await api.post('/payments/confirm-membership', {
      paymentIntentId,
      membershipPlanId,
      billingCycle,
      autoRenew
    });
    return response.data;
  }

  // Get customer's payment methods
  async getPaymentMethods(): Promise<{ success: boolean; paymentMethods: PaymentMethod[] }> {
    const response = await api.get('/payments/payment-methods');
    return response.data;
  }
}

export const paymentService = new PaymentService();
