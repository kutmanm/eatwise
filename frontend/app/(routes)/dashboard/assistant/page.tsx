'use client';

import { RiRobot2Fill } from 'react-icons/ri';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OnboardingCheck } from '@/components/onboarding/OnboardingCheck';

function AssistantContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <RiRobot2Fill className="text-4xl text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Assistant</h1>
          <p className="text-xl text-gray-600">Coming Soon</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-gray-500 text-sm">
            We're working on bringing you an amazing AI assistant experience. 
            Stay tuned for exciting updates!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingCheck>
          <AssistantContent />
        </OnboardingCheck>
      </ProtectedRoute>
    </AuthProvider>
  );
}