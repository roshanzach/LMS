'use client';

import React from 'react';
import { Users, UserCog, BarChart3, Bell, Activity } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <span className={color}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, Super Admin. Here&apos;s what&apos;s happening across the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<UserCog className="w-5 h-5" />}
          label="College Admins"
          value="—"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value="—"
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Active Colleges"
          value="—"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          value="—"
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">System Status</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'API Server', status: 'Operational', ok: true },
            { label: 'Database (Supabase)', status: 'Operational', ok: true },
            { label: 'Authentication Service', status: 'Operational', ok: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                item.ok ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-blue-800 mb-2">Getting Started</h3>
        <ul className="text-sm text-blue-700 space-y-1.5 list-disc list-inside">
          <li>Use <strong>College Admin Management</strong> to create admin accounts for each college.</li>
          <li>College Admins will log in using the credentials you assign them.</li>
          <li>Monitor platform usage from <strong>Reports &amp; Analytics</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
