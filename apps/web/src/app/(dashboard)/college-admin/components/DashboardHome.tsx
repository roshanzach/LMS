'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  UserCheck,
  BookOpen,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardHomeProps {
  onOpenModal: (type: 'student' | 'faculty' | 'course') => void;
}

export default function DashboardHome({ onOpenModal }: DashboardHomeProps) {
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user?.username) {
            // Capitalize first letter of username for presentation
            const capitalized = user.username.charAt(0).toUpperCase() + user.username.slice(1);
            setUsername(capitalized);
          }
        } catch (e) {
          console.error('Error parsing user info', e);
        }
      }
    }
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {username}
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Here is the status of the Computer Science Department for Semester 6.
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => {}}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Add Student</span>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
        >
          <UserCheck className="w-4 h-4 text-white" />
          <span>Add Faculty</span>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
        >
          <BookOpen className="w-4 h-4 text-white" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CO-PO Attainment */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                CO-PO Attainment
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-400 tracking-tight">--</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Faculty Compliance */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Faculty Compliance
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-400 tracking-tight">--</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Students At Risk */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Students at Risk
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-slate-400 tracking-tight">--</span>
              <span className="text-xs text-slate-400 font-medium">/ -- Total</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
