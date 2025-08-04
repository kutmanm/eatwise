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
    
    if (pathname.includes('/dashboard/add-meal')) return 'Add Meal';
    if (pathname.includes('/dashboard/profile')) return 'Profile';
    if (pathname.includes('/dashboard/history')) return 'History';
    if (pathname.includes('/dashboard/progress')) return 'Progress';
    if (pathname.includes('/dashboard/coach')) return 'AI Coach';
    if (pathname.includes('/dashboard')) return 'Diary';
    if (pathname.includes('/onboarding')) return 'Setup';
    return 'EatWise';
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-[#00b800]">EatWise</h1>
              <span className="text-neutral-400">•</span>
              <h2 className="text-lg font-semibold text-neutral-900">{getPageTitle()}</h2>
            </div>
            
            {/* Desktop Navigation - Optional for larger screens */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Add desktop nav items here if needed */}
            </div>
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