'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BottomNavBar } from '@/components/mobile/BottomNavBar';
import { SettingsDropdown } from '@/components/layout/SettingsDropdown';
import { IoArrowBack } from 'react-icons/io5';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't show layout on landing page
  if (pathname === '/') {
    return <>{children}</>;
  }

  // Check if we're on a dashboard page
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Special handling for scan page - full screen layout
  if (pathname.includes('/dashboard/add-meal')) {
    return (
      <div className="h-screen w-screen relative">
        {/* Scan page navbar */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <IoArrowBack size={20} className="text-gray-700" />
            </button>
            <h2 className="text-lg font-medium text-white bg-black/50 px-3 py-1 rounded-full">Scan</h2>
            <div className="w-10 h-10" /> {/* Spacer for center alignment */}
          </div>
        </header>
        
        {children}
        
        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    );
  }

  // Get page title based on current route
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    
    if (pathname.includes('/dashboard/add-meal')) return 'Scan';
    if (pathname.includes('/dashboard/assistant')) return 'Assistant';
    if (pathname.includes('/dashboard/settings')) return 'Settings';
    if (pathname.includes('/dashboard/profile')) return 'Plan';
    if (pathname.includes('/dashboard/history')) return 'Food log';
    if (pathname.includes('/dashboard/progress')) return 'Progress';
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
          <div className="flex justify-between items-center h-16">
            <div className="w-10"></div> {/* Spacer for centering */}
            <h2 className="text-lg font-medium text-gray-900">{getPageTitle()}</h2>
            {isDashboardPage ? <SettingsDropdown /> : <div className="w-10"></div>}
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