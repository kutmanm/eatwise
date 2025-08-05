'use client';

import { useRouter } from 'next/navigation';
import { RiSettings4Fill } from 'react-icons/ri';

export function SettingsDropdown() {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  return (
    <button
      onClick={handleSettingsClick}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      title="Settings"
    >
      <RiSettings4Fill size={20} />
    </button>
  );
}