import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { subscriptionApi } from '@/lib/api/subscription';
import { SubscriptionStatus } from '@/types';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const subscribeToPlan = async (plan: string, promoCode?: string) => {
    if (!user) {
      router.push('/auth/login?redirect=/pricing');
      return;
    }
    
    setLoading(true);
    try {
      const response = await subscriptionApi.createCheckoutSession(plan, promoCode);
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setBillingLoading(true);
    try {
      const response = await subscriptionApi.getBillingPortalUrl();
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to open billing portal');
      console.error(error);
    } finally {
      setBillingLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setCancelLoading(true);
    try {
      const response = await subscriptionApi.cancelSubscription();
      
      if (response.error) {
        toast.error(response.error);
      } else if (response.data?.success) {
        toast.success('Your subscription has been canceled');
        // Refresh user to update subscription status
        await refreshUser();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error(error);
    } finally {
      setCancelLoading(false);
    }
  };

  const isPremium = user?.role === 'premium';
  const isTrial = user?.role === 'trial';

  return {
    subscribeToPlan,
    openBillingPortal,
    cancelSubscription,
    loading,
    billingLoading,
    cancelLoading,
    isPremium,
    isTrial
  };
};

export default useSubscription;