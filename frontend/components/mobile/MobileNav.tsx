'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface MobileNavProps {
  onClose?: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/dashboard/add-meal', label: 'Add Meal', icon: '➕' },
    { path: '/dashboard/history', label: 'History', icon: '📊' },
    { path: '/dashboard/progress', label: 'Progress', icon: '📈' },
    { path: '/dashboard/coach', label: 'AI Coach', icon: '🤖' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose?.();
  };

  return (
    <div className="mobile-nav safe-bottom">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center space-y-1 touch-target p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}