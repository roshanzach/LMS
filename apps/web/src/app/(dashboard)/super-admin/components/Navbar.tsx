'use client';

import React from 'react';
import { GraduationCap, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">UniLMS</span>
          <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Super Admin
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ml-1 select-none">
          SA
        </div>

        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors duration-150"
          aria-label="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
