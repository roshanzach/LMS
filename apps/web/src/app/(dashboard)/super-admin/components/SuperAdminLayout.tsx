'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar, { SidebarView } from './Sidebar';
import DashboardHome from './DashboardHome';
import CollegeAdminManagement from './CollegeAdminManagement';
import PlaceholderView from './PlaceholderView';

const VIEW_LABELS: Record<SidebarView, string> = {
  dashboard: 'Dashboard',
  'college-admin-management': 'College Admin Management',
  'user-management': 'User Management',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
};

function MainContent({ view }: { view: SidebarView }) {
  switch (view) {
    case 'dashboard':
      return <DashboardHome />;
    case 'college-admin-management':
      return <CollegeAdminManagement />;
    case 'user-management':
      return <PlaceholderView title="User Management" />;
    case 'reports':
      return <PlaceholderView title="Reports & Analytics" />;
    case 'notifications':
      return <PlaceholderView title="Notifications" />;
    default:
      return <DashboardHome />;
  }
}

export default function SuperAdminLayout() {
  const [activeView, setActiveView] = useState<SidebarView>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar — always visible */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — always visible */}
        <Sidebar activeView={activeView} onNavigate={setActiveView} />

        {/* Main Content Area — updates on sidebar click */}
        <main className="flex-1 overflow-y-auto" aria-label={VIEW_LABELS[activeView]}>
          <MainContent view={activeView} />
        </main>
      </div>
    </div>
  );
}
