'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: '$9.99',
      interval: 'month',
      features: [
        'Unlimited meal logging',
        'Advanced AI coaching chat',
        'Full history access',
        'Detailed nutrition analysis',
        'AI recipe suggestions',
        'Export data functionality'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: '$167.88',
      interval: 'year',
      features: [
        'Unlimited meal logging',
        'Advanced AI coaching chat',
        'Full history access',
        'Detailed nutrition analysis',
        'AI recipe suggestions',
        'Export data functionality',
        '2 months free!'
      ]
    }
  ];

  const handleSubscription = async (planId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }

    setLoading(planId);
    try {
      console.log(`Creating checkout for plan: ${planId}, promo: ${promoCode || 'none'}`);
      
      const response = await apiClient.post<{ checkout_url: string; session_id: string }>('/api/users/create-checkout-session', { 
        plan: planId,
        promo_code: promoCode || undefined
      });

      console.log("Checkout response:", response);

      if (response.error) {
        toast.error(response.error);
      } else if (response.data?.checkout_url) {
        toast.success("Redirecting to checkout...");
        // Small delay for the toast to be visible
        setTimeout(() => {
          window.location.href = response.data!.checkout_url;
        }, 1000);
      } else {
        toast.error("No checkout URL returned");
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock premium features with our subscription plans. All plans include a 7-day free trial.
        </p>
        
                  <div className="mt-6 max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
            <div className="flex">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded-l-md border border-gray-300 p-2"
                placeholder="Enter promo code"
              />
              <button 
                type="button"
                className="bg-gray-200 px-4 rounded-r-md border border-l-0 border-gray-300 hover:bg-gray-300 transition-colors"
                onClick={() => {
                  if (!promoCode) {
                    toast.error('Please enter a promo code');
                    return;
                  }
                  toast.success(`Promo code "${promoCode}" will be applied at checkout`);
                }}
              >
                Apply
              </button>
            </div>
            {promoCode && (
              <p className="text-xs text-green-600 mt-1">
                Promo code "{promoCode}" will be applied at checkout
              </p>
            )}
          </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-500">Billed {plan.interval}ly</p>
              </div>
              <div className="text-2xl font-bold">{plan.price}</div>
            </div>
            
            <ul className="mt-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center py-2">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleSubscription(plan.id)} 
              loading={loading === plan.id}
              disabled={!!loading}
              className="w-full"
            >
              Start 7-Day Free Trial
            </Button>
            <p className="text-xs text-center mt-4 text-gray-500">
              Cancel anytime during your trial and you won't be charged
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}