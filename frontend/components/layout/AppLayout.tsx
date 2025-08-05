'use client';

import { usePathname } from 'next/navigation';
import { BottomNavBar } from '@/components/mobile/BottomNavBar';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Don't show layout on landing page
  if (pathname === '/') {
    return <>{children}</>;
  }

  // Get page title based on current route
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    
    if (pathname.includes('/dashboard/add-meal')) return 'Scan';
    if (pathname.includes('/dashboard/profile')) return 'Plan';
    if (pathname.includes('/dashboard/history')) return 'Food log';
    if (pathname.includes('/dashboard/progress')) return 'Plan';
    if (pathname.includes('/dashboard/coach')) return 'Plan';
    if (pathname.includes('/dashboard')) return 'Home';
    if (pathname.includes('/onboarding')) return 'Setup';
    return 'Home';
  };

  return (
    <div className="min-h-screen">
      {/* Simple Header */}
      <header className="bg-white border-none sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h2 className="text-lg font-medium text-gray-900">{getPageTitle()}</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}