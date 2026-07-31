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
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Building2,
} from 'lucide-react';

interface DashboardHomeProps {
  onOpenModal: (type: 'student' | 'faculty' | 'course') => void;
  onNavigate?: (tab: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function DashboardHome({ onOpenModal, onNavigate }: DashboardHomeProps) {
  const [username, setUsername] = useState('Admin');
  const [collegeName, setCollegeName] = useState('');
  const [metrics, setMetrics] = useState({
    students: 0,
    faculty: 0,
    attendance: '0%',
  });

  const [counts, setCounts] = useState({
    departments: 0,
    programs: 0,
    schemes: 0,
    batches: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  const getAuthHeaders = () => {
    let headers: Record<string, string> = { 'x-user-role': 'COLLEGE_ADMIN' };
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        headers['x-user-role'] = user.role;
        if (user.username) headers['x-username'] = user.username;
      }
    }
    return headers;
  };

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
          if (user?.collegeName) {
            setCollegeName(user.collegeName);
          }
        } catch (e) {
          console.error('Error parsing user info', e);
        }
      }
    }

    // Fetch counts for onboarding checklist and stats
    const fetchCounts = async () => {
      try {
        const [depRes, progRes, schRes, batRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/college-admin/departments`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/college-admin/programs`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/college-admin/schemes`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/college-admin/batches`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/college-admin/dashboard-stats`, { headers: getAuthHeaders() }),
        ]);

        if (depRes.ok && progRes.ok && schRes.ok && batRes.ok) {
          const deps = await depRes.json();
          const progs = await progRes.json();
          const schs = await schRes.json();
          const bats = await batRes.json();
          setCounts({
            departments: deps.length || 0,
            programs: progs.length || 0,
            schemes: schs.length || 0,
            batches: bats.length || 0,
          });
        }

        if (statsRes && statsRes.ok) {
          const stats = await statsRes.json();
          setMetrics({
            students: stats.totalStudents || 0,
            faculty: stats.totalFaculty || 0,
            attendance: stats.avgAttendance || '0%',
          });
        }

      } catch (err) {
        console.error('Failed to fetch stats for onboarding', err);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);

  const steps = [
    {
      title: '1. Create Departments',
      desc: 'Set up your college departments (e.g., CSE, ECE).',
      done: counts.departments > 0,
      icon: Building2,
      tab: 'departments',
    },
    {
      title: '2. Create Programs',
      desc: 'Add degree programs under departments (e.g., B.Tech CSE).',
      done: counts.programs > 0,
      icon: GraduationCap,
      tab: 'departments',
    },
    {
      title: '3. Configure Schemes',
      desc: 'Define university regulations and curriculum structures.',
      done: counts.schemes > 0,
      icon: Layers,
      tab: 'departments',
    },
    {
      title: '4. Register Batches',
      desc: 'Create admission batches (e.g., 2024–2028 Batch).',
      done: counts.batches > 0,
      icon: BookOpen,
      tab: 'batches',
    },
  ];

  const allStepsDone = steps.every((s) => s.done);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {username}
            </h2>
            {collegeName && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                {collegeName}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Here is the institutional overview for {collegeName || 'your college workspace'}.
          </p>
        </div>
      </div>

      {/* Getting Started / Onboarding Guide Card */}
      {!loadingCounts && !allStepsDone && (
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Getting Started with Your College Setup</h3>
                <p className="text-xs text-blue-200 font-medium">Follow this sequence to structure your institutional data without missing dependencies.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onNavigate && onNavigate(step.tab)}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      step.done
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer text-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${step.done ? 'text-emerald-400' : 'text-blue-300'}`} />
                        {step.done ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full">
                            Step {idx + 1}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold">{step.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
                    </div>
                    {!step.done && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-300 group">
                        <span>Go to {step.tab}</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Students Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205">
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

        {/* Faculty Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205">
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

        {/* Attendance Metric */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-205">
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
