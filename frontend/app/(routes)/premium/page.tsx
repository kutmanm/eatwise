'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'premium_monthly',
    name: 'Monthly',
    price: '$9.99',
    interval: 'month',
    features: [
      'Personalized meal recommendations',
      'Advanced nutrition tracking',
      'AI meal analysis',
      'Custom meal plans',
      'Premium analytics'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Yearly',
    price: '$99.99',
    interval: 'year',
    features: [
      'All Monthly features',
      '2 months free',
      'Priority support',
      'Early access to new features'
    ]
  }
];

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/premium');
      return;
    }

    try {
      setLoading(planId);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade to Premium</h1>
        <p className="text-lg text-neutral-600">
          Get access to advanced features and personalized nutrition guidance
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">
              {plan.price}
              <span className="text-base font-normal text-neutral-600">
                /{plan.interval}
              </span>
            </p>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(plan.id)}
              loading={loading === plan.id}
              className="w-full"
            >
              {loading === plan.id ? 'Processing...' : `Subscribe ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-neutral-600">
        <p>
          All plans include a 14-day money-back guarantee. Cancel anytime.
          <br />
          Questions? Contact our support team.
        </p>
      </div>
    </div>
  );
}
