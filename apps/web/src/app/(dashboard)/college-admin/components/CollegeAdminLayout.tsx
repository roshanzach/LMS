'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileCheck,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Grid,
  Plus,
  LogOut,
  CheckCircle2,
  X,
  Building2,
  BookOpen,
  Layers,
} from 'lucide-react';
import DashboardHome from './DashboardHome';
import PlaceholderView from './PlaceholderView';
import AddStudentModal from './AddStudentModal';
import AddFacultyModal from './AddFacultyModal';
import AddCourseModal from './AddCourseModal';
import DepartmentManagement from './DepartmentManagement';
import ProgramManagement from './ProgramManagement';
import SchemeManagement from './SchemeManagement';
import BatchManagement from './BatchManagement';

type ActiveView =
  | 'overview'
  | 'dept-mgmt'
  | 'program-mgmt'
  | 'scheme-mgmt'
  | 'batch-mgmt'
  | 'faculty-mgmt'
  | 'student-mgmt'
  | 'settings'
  | 'support';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: 'dept-mgmt',
    label: 'Departments',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'program-mgmt',
    label: 'Programs',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'scheme-mgmt',
    label: 'Schemes & Regulations',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: 'batch-mgmt',
    label: 'Batches',
    icon: <Grid className="w-5 h-5" />,
  },
  {
    id: 'faculty-mgmt',
    label: 'Faculty',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'student-mgmt',
    label: 'Students',
    icon: <Users className="w-5 h-5" />,
  },
];

export default function CollegeAdminLayout() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [activeModal, setActiveModal] = useState<'student' | 'faculty' | 'course' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('Admin');
  const [initials, setInitials] = useState('AD');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        router.push('/login');
        return;
      }
      try {
        const user = JSON.parse(stored);
        if (user?.role !== 'COLLEGE_ADMIN') {
          router.push('/login');
          return;
        }
        if (user?.username) {
          const capitalized = user.username.charAt(0).toUpperCase() + user.username.slice(1);
          setUsername(capitalized);
          const chars = user.username.slice(0, 2).toUpperCase();
          setInitials(chars);
        }
      } catch (e) {
        console.error('Error parsing user details', e);
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    router.push('/login');
  };

  const handleSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-50">
          <h1 className="text-lg font-black tracking-tight text-blue-900">
            Bharat-LMS
          </h1>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">
            Admin Dashboard
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 text-left group relative
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-700 rounded-r-full" />
                )}
                <span className={isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}>
                  {item.icon}
                </span>
                <span className="truncate leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Controls */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Generate Report Button */}
          <button
            onClick={() => handleSuccess('Triggered system report generation. Preparing pdf…')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          {/* Settings & Support Links */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition text-left
                ${
                  activeView === 'settings'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <Settings className="w-4.5 h-4.5 text-slate-400" />
              <span className="leading-none">Settings</span>
            </button>

            <button
              onClick={() => setActiveView('support')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition text-left
                ${
                  activeView === 'support'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
            >
              <HelpCircle className="w-4.5 h-4.5 text-slate-400" />
              <span className="leading-none">Support</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN APP CONTAINER ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-10">
          
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search data, reports, or faculty..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <button
              onClick={() => handleSuccess('You have no new notifications.')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Help */}
            <button
              onClick={() => setActiveView('support')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Apps Menu */}
            <button
              onClick={() => handleSuccess('Grid applications menu clicked.')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Applications"
            >
              <Grid className="w-5 h-5" />
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden flex items-center justify-center focus:outline-none active:scale-95 transition"
                aria-label="Profile menu"
              >
                {/* Fallback initials if avatar fails */}
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {initials}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  {/* Overlay click to close */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-3 duration-150">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs font-black text-slate-800 leading-tight">{username}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{username.toLowerCase()}@collegeadmin.local</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Inner Page Screen */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'overview' && <DashboardHome onOpenModal={setActiveModal} />}
          {activeView === 'dept-mgmt' && <DepartmentManagement />}
          {activeView === 'program-mgmt' && <ProgramManagement />}
          {activeView === 'scheme-mgmt' && <SchemeManagement />}
          {activeView === 'batch-mgmt' && <BatchManagement />}
          {activeView === 'faculty-mgmt' && <PlaceholderView title="Faculty Management" />}
          {activeView === 'student-mgmt' && <PlaceholderView title="Student Management" />}
          {activeView === 'settings' && <PlaceholderView title="Settings" />}
          {activeView === 'support' && <PlaceholderView title="Support" />}
        </main>
      </div>

      {/* ─── MODAL OVERLAYS ────────────────────────────────────────────────── */}
      {activeModal === 'student' && (
        <AddStudentModal
          onClose={() => setActiveModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {activeModal === 'faculty' && (
        <AddFacultyModal
          onClose={() => setActiveModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {activeModal === 'course' && (
        <AddCourseModal
          onClose={() => setActiveModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* ─── FLOATING TOAST NOTIFICATION ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
