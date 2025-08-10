'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useSubscription from '@/hooks/useSubscription';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api/users';
import type { SubscriptionStatus } from '@/types';
import { format } from 'date-fns';

export default function AccountPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    openBillingPortal, 
    cancelSubscription, 
    billingLoading, 
    cancelLoading,
    // isPremium,
    // isTrial
  } = useSubscription();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          const response = await usersApi.getSubscriptionInfo();
          if (response.data) {
            setSubscription(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch subscription', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  return (
    <ProtectedRoute requireAuth>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="grid gap-8">
          {/* Subscription Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            {loading ? (
              <div>Loading subscription details...</div>
            ) : subscription ? (
              <div>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current plan</p>
                    <p className="font-medium">{subscription.plan || 'Free'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        subscription.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      <p className="font-medium capitalize">{subscription.status}</p>
                    </div>
                  </div>

                  {subscription.started_at && (
                    <div>
                      <p className="text-sm text-gray-500">Started</p>
                      <p className="font-medium">
                        {format(new Date(subscription.started_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  
                  {subscription.expires_at && (
                    <div>
                      <p className="text-sm text-gray-500">
                        {subscription.is_trialing ? 'Trial ends' : 'Next billing date'}
                      </p>
                      <p className="font-medium">
                        {format(new Date(subscription.expires_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={openBillingPortal}
                    loading={billingLoading}
                  >
                    Manage Billing
                  </Button>
                  
                  {subscription.is_active && !subscription.is_canceled && (
                    <Button 
                      variant="outline" 
                      onClick={cancelSubscription}
                      loading={cancelLoading}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">You don't have an active subscription.</p>
                <Button onClick={() => window.location.href = '/pricing'}>
                  View Plans
                </Button>
              </div>
            )}
          </Card>
          
          {/* Account Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="mb-6">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium capitalize">{user?.role || 'Unknown'}</p>
            </div>
            
            <Button variant="outline">Change Email</Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}