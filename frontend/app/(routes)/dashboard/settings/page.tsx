'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/layout/FeedbackModal';

function SettingsContent() {
  const router = useRouter();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleSignOut = async () => {
    // Clear any stored auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    router.push('/');
  };

  return (
    <>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Main Actions */}
          <div className="space-y-4">
            <Button 
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-full py-4 text-lg"
              size="lg"
            >
              Give Feedback
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="w-full py-4 text-lg text-red-600 border-red-300 hover:bg-red-50"
              size="lg"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <SettingsContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}