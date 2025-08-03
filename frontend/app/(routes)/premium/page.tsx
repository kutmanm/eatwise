'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSubscription } from '@/hooks/useUser';

function PremiumContent() {
  const router = useRouter();
  const { subscription, loading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would redirect to Stripe Checkout
      // For now, we'll simulate the upgrade process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation:
      // 1. Create Stripe checkout session
      // 2. Redirect to Stripe
      // 3. Handle success/cancel callbacks
      // 4. Update subscription status
      
      alert('This would redirect to Stripe Checkout in a real implementation');
      
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = () => {
    // In real implementation, redirect to Stripe customer portal
    alert('This would redirect to Stripe Customer Portal in a real implementation');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
              >
                ← Back
              </Button>
              <h1 className="text-xl font-semibold text-neutral-900">
                {isPremium ? 'Premium Subscription' : 'Upgrade to Premium'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPremium ? (
          /* Premium User Dashboard */
          <div className="space-y-8">
            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h2 className="text-2xl font-bold mb-2">You're Premium!</h2>
                <p className="text-primary-100 mb-4">
                  Enjoying unlimited AI coaching and advanced features
                </p>
                <Button 
                  variant="secondary"
                  onClick={handleManageSubscription}
                  className="bg-white text-primary-600 hover:bg-neutral-100"
                >
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🤖 AI Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-4">
                    Ask unlimited questions and get personalized nutrition advice
                  </p>
                  <Button onClick={() => router.push('/dashboard/coach')}>
                    Open AI Coach
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-4">
                    View detailed progress charts and nutrition insights
                  </p>
                  <Button onClick={() => router.push('/dashboard/progress')}>
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🍽️ Meal Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-4">
                    Get AI-powered meal recommendations based on your goals
                  </p>
                  <Button onClick={() => router.push('/dashboard/coach')}>
                    Get Suggestions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📱 Export Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-4">
                    Download your nutrition data and progress reports
                  </p>
                  <Button variant="outline">
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Upgrade Flow */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Unlock Your Full Potential
              </h1>
              <p className="text-xl text-neutral-600 mb-8">
                Get unlimited AI coaching, advanced analytics, and personalized meal recommendations
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-md mx-auto">
              <Card className="border-2 border-primary-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Premium Plan</CardTitle>
                  <div className="text-4xl font-bold text-primary-600">
                    $9.99
                    <span className="text-lg text-neutral-600 font-normal">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleUpgrade}
                    loading={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade Now'}
                  </Button>
                  
                  <div className="text-center text-sm text-neutral-600">
                    Cancel anytime • No hidden fees
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🆓</span>
                    Free Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      3 meal logs per day
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Basic nutrition tracking
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Daily AI tips
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      7-day history
                    </li>
                    <li className="flex items-center">
                      <span className="text-neutral-400 mr-3">✗</span>
                      <span className="text-neutral-500">AI coaching chat</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-neutral-400 mr-3">✗</span>
                      <span className="text-neutral-500">Meal suggestions</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-neutral-400 mr-3">✗</span>
                      <span className="text-neutral-500">Advanced analytics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-primary-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-600">
                    <span className="mr-2">✨</span>
                    Premium Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Unlimited meal logs
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Advanced nutrition tracking
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      AI coaching chat
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Unlimited history
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Personalized meal suggestions
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Detailed progress analytics
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      Data export
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-lg p-8">
              <h3 className="text-2xl font-bold text-neutral-900 text-center mb-8">
                What our Premium users say
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
                  <p className="text-neutral-600 mb-4">
                    "The AI coach helped me understand my nutrition better than any app I've used before."
                  </p>
                  <div className="font-medium text-neutral-900">Sarah M.</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
                  <p className="text-neutral-600 mb-4">
                    "Finally hit my protein goals with the personalized meal suggestions!"
                  </p>
                  <div className="font-medium text-neutral-900">Mike R.</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
                  <p className="text-neutral-600 mb-4">
                    "The detailed analytics show exactly where I can improve. Love it!"
                  </p>
                  <div className="font-medium text-neutral-900">Emma K.</div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Can I cancel anytime?</h4>
                  <p className="text-neutral-600">Yes, you can cancel your subscription at any time. You'll continue to have access to Premium features until the end of your billing period.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Is my data secure?</h4>
                  <p className="text-neutral-600">Absolutely. We use industry-standard encryption and never share your personal data with third parties.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">What happens to my data if I downgrade?</h4>
                  <p className="text-neutral-600">Your data is always safe. Free users can access the last 7 days of meal logs, while Premium users get unlimited history.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <PremiumContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}