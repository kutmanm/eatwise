'use client';

import { useRouter, usePathname } from 'next/navigation';
// Import specific icons with fallback
let LuScanLine: any, AiFillHome: any, FaCalendarAlt: any;

try {
  ({ LuScanLine } = require('react-icons/lu'));
  ({ AiFillHome } = require('react-icons/ai'));
  ({ FaCalendarAlt } = require('react-icons/fa'));
} catch (e) {
  // Fallback если react-icons не установлены
  LuScanLine = ({ size }: { size: number }) => <span style={{ fontSize: `${size}px` }}>📷</span>;
  AiFillHome = ({ size }: { size: number }) => <span style={{ fontSize: `${size}px` }}>🏠</span>;
  FaCalendarAlt = ({ size }: { size: number }) => <span style={{ fontSize: `${size}px` }}>📅</span>;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  isIconOnly?: boolean;
}

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Home',
      icon: <AiFillHome size={24} />,
    },
    {
      path: '/dashboard/add-meal',
      label: 'Scan',
      icon: <LuScanLine size={28} />,
      isIconOnly: false,
    },
    {
      path: '/dashboard/profile',
      label: 'Plan',
      icon: <FaCalendarAlt size={24} />,
      isIconOnly: false,
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg safe-bottom z-50 md:hidden">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center transition-all duration-200 px-3 flex-1 ${
                active
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Область для иконки */}
              <div className={`flex items-center justify-center h-[36px] ${active ? 'scale-105' : ''} transition-transform duration-200`}>
                {item.icon}
              </div>
              
              {/* Область для текста */}
              <div className="h-[16px] flex items-center justify-center">
                {!item.isIconOnly && (
                  <span className={`text-xs font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}