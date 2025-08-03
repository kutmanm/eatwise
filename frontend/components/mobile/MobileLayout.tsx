'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Don't show mobile nav on auth pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/';
  const showMobileNav = !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <div className={`flex-1 ${showMobileNav ? 'pb-20' : ''}`}>
        {children}
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && (
        <MobileNav onClose={() => setIsMobileNavOpen(false)} />
      )}
    </div>
  );
}