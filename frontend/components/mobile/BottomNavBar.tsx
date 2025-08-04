'use client';

import { useRouter, usePathname } from 'next/navigation';
// Import FontAwesome icons with fallback
let FaClipboardList: any, FaCirclePlus: any, FaUser: any;

try {
  ({ FaClipboardList, FaCirclePlus, FaUser } = require('react-icons/fa6'));
} catch (e) {
  // Fallback если react-icons не установлены
  FaClipboardList = ({ size }: { size: number }) => <span style={{ fontSize: size }}>📋</span>;
  FaCirclePlus = ({ size }: { size: number }) => <span style={{ fontSize: size }}>➕</span>;
  FaUser = ({ size }: { size: number }) => <span style={{ fontSize: size }}>👤</span>;
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
      label: 'Diary',
      icon: <FaClipboardList size={28} />,
    },
    {
      path: '/dashboard/add-meal',
      label: 'Add',
      icon: <FaCirclePlus size={40} />,
      isIconOnly: true,
    },
    {
      path: '/dashboard/profile',
      label: 'Me',
      icon: <FaUser size={28} />,
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-bottom z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isPlusButton = item.path === '/dashboard/add-meal';
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center transition-all duration-200 ${
                isPlusButton 
                  ? 'px-4' // Padding для плюса
                  : 'px-3 flex-1' // Равномерное распределение для остальных
              } ${
                active
                  ? 'text-[#00b800]'
                  : 'text-[#3b3836] hover:text-[#00b800]'
              }`}
            >
              {/* Область для иконки - фиксированная высота для всех */}
              <div className={`flex items-center justify-center h-[40px] ${active && !isPlusButton ? 'scale-105' : ''} transition-transform duration-200`}>
                {item.icon}
              </div>
              
              {/* Область для текста - фиксированная высота для всех */}
              <div className="h-[16px] flex items-center justify-center">
                {!item.isIconOnly && (
                  <span className={`text-[10px] font-medium ${active ? 'text-[#00b800]' : 'text-[#3b3836]'}`}>
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