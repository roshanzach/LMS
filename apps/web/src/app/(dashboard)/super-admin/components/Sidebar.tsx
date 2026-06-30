'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  Bell,
} from 'lucide-react';

export type SidebarView =
  | 'dashboard'
  | 'college-admin-management'
  | 'user-management'
  | 'reports'
  | 'notifications';

interface NavItem {
  id: SidebarView;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4.5 h-4.5" />,
  },
  {
    id: 'college-admin-management',
    label: 'College Admin Management',
    icon: <UserCog className="w-4.5 h-4.5" />,
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <Users className="w-4.5 h-4.5" />,
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <BarChart3 className="w-4.5 h-4.5" />,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="w-4.5 h-4.5" />,
  },
];

interface SidebarProps {
  activeView: SidebarView;
  onNavigate: (view: SidebarView) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 shadow-sm flex flex-col flex-shrink-0">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Sidebar navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              <span
                className={`w-1 h-5 rounded-full flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'bg-blue-600' : 'bg-transparent group-hover:bg-slate-200'
                }`}
              />
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              <span className="truncate leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 font-medium text-center">
          UniLMS v0.1.0 · Super Admin
        </p>
      </div>
    </aside>
  );
}
