'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Array<'free' | 'premium' | 'trial'>;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = '/auth/login',
}) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Set isClient to true when component mounts on the client
  useEffect(() => {
    setIsClient(true);
    
    // This helps debug authentication issues
    if (user) {
      console.log('Protected route - User authenticated:', user.email);
    }
  }, [user]);

  // Handle redirects in useEffect, not during render
  useEffect(() => {
    // Don't redirect if still loading or not on client
    if (authLoading || !isClient) return;

    // Debug auth state
    console.log('Auth state in ProtectedRoute:', { 
      requireAuth, 
      user: user?.email || 'not logged in',
      allowedRoles: allowedRoles?.join(',') || 'any role',
      userRole: user?.role || 'no role' 
    });

    // If auth is required and user is not logged in
    if (requireAuth && !user) {
      console.log('Not authenticated, should redirect to:', redirectTo);
      // Don't redirect immediately to avoid potential loops
      // Instead set a flag and handle redirect after a delay
      setShouldRedirect(true);
      return;
    }
    
    // If we got here and previously thought we should redirect, reset that
    if (shouldRedirect) {
      setShouldRedirect(false);
    }
    
    // Handle role restrictions differently - don't automatically redirect
    // We'll show appropriate UI instead
  }, [user, authLoading, requireAuth, allowedRoles, redirectTo, router, isClient]);

  // Handle the actual redirect with a delay to avoid potential loops
  useEffect(() => {
    if (shouldRedirect && isClient) {
      const timer = setTimeout(() => {
        console.log('Executing redirect to:', redirectTo);
        window.location.href = redirectTo; // Use window.location instead of router to break potential loops
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, redirectTo, isClient]);
  
  // Show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Don't render children if auth is required and user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
        <div className="ml-3">Checking authentication...</div>
      </div>
    );
  }
  
  // For role restrictions, render the children with a warning banner if needed
  if (user && allowedRoles && user.role && !allowedRoles.includes(user.role as any)) {
    const isPremiumContent = allowedRoles.includes('premium');
    
    // If this is premium content and user is not premium, wrap children with upgrade banner
    if (isPremiumContent && user.role !== 'premium') {
      return (
        <>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  This feature requires a premium subscription.{' '}
                  <a href="/pricing" className="font-medium underline text-amber-700 hover:text-amber-600">
                    Upgrade now
                  </a>
                </p>
              </div>
            </div>
          </div>
          {children}
        </>
      );
    }
    
    // For other role restrictions, just show a generic message
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="mb-4">You don't have the required permissions to access this page.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
};