'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  UserCheck,
  Users,
  GraduationCap,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface DashboardHomeProps {
  onOpenModal: (type: 'student' | 'faculty' | 'course') => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function DashboardHome({ onOpenModal }: DashboardHomeProps) {
  const [username, setUsername] = useState('Admin');
  const [metrics, setMetrics] = useState({
    students: 1240,
    faculty: 84,
    attendance: '92.4%',
    fees: '₹12.8L',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user?.username) {
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
          Here is the institutional overview for the current academic session.
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-4 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm max-w-xl">
        <button
          onClick={() => onOpenModal('student')}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Add Student (Mock)</span>
        </button>

        <button
          onClick={() => onOpenModal('faculty')}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150"
        >
          <UserCheck className="w-4 h-4 text-white" />
          <span>Add Faculty (Mock)</span>
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Students Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205 flex flex-col justify-between h-[150px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {metrics.students}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 4.2% from last term</span>
        </div>

        {/* Faculty Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205 flex flex-col justify-between h-[150px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Active Faculty
              </span>
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-750">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {metrics.faculty}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">100% profile compliance</span>
        </div>

        {/* Attendance Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205 flex flex-col justify-between h-[150px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Avg Attendance
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {metrics.attendance}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Stable tracking threshold</span>
        </div>

        {/* Fee Collection Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205 flex flex-col justify-between h-[150px]">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Fee Collection
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {metrics.fees}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-amber-600 font-bold">85% total collected</span>
        </div>

      </div>

      {/* Lightweight Pending Approvals Row */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-4xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Pending Tasks & Approvals
          </h3>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
            3 items
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-550">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Faculty course assignments</p>
                <p className="text-[10px] text-slate-400 font-medium">Verify department workload distributions</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-550">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Batch scheme mappings approval</p>
                <p className="text-[10px] text-slate-400 font-medium">Check KTU 2024 schemes for incoming batches</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-150 flex items-center justify-center text-emerald-600 bg-emerald-50">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Academic calendars finalized</p>
                <p className="text-[10px] text-slate-400 font-medium">Semester term plans configured</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-350" />
          </div>
        </div>
      </div>
    </div>
  );
}
