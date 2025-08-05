import { apiClient } from './client';
import type { SubscriptionPlan, SubscriptionStatus } from '@/types';

export const subscriptionApi = {
  /**
   * Create a Stripe checkout session for subscription
   */
  createCheckoutSession: (plan: string, promoCode?: string) => 
    apiClient.post<{ checkout_url: string; session_id: string }>('/api/users/create-checkout-session', {
      plan,
      promo_code: promoCode
    }),

  /**
   * Get a URL to the Stripe billing portal for subscription management
   */
  getBillingPortalUrl: () => 
    apiClient.get<{ url: string }>('/api/users/billing-portal'),
  
  /**
   * Get available subscription plans
   */
  getSubscriptionPlans: () => 
    apiClient.get<Record<string, SubscriptionPlan>>('/api/users/subscription-plans'),
  
  /**
   * Cancel current subscription
   */
  cancelSubscription: () => 
    apiClient.post<{ success: boolean }>('/api/users/cancel-subscription'),

  /**
   * Get current subscription status
   */
  getSubscriptionStatus: () =>
    apiClient.get<SubscriptionStatus>('/api/users/subscription')
};