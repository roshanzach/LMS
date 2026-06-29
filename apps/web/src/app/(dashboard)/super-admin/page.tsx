import React from 'react';
import Link from 'next/link';
import { Shield, Building2, Key, BarChart3, LogOut } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">UniLMS</h1>
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            Super Admin Console
          </span>
        </div>
        <Link 
          href="/login"
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">System Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: College Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Building2 className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">College Directory</h3>
            <p className="text-sm text-slate-500 mb-4">
              Add, audit, and configure engineering colleges onboarded to the LMS.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Manage Colleges →</button>
          </div>

          {/* Card 2: Global Config */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Key className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">License Keys</h3>
            <p className="text-sm text-slate-500 mb-4">
              Issue and revoke software operational licenses for institutional tenants.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Manage Licenses →</button>
          </div>

          {/* Card 3: System Analytics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <BarChart3 className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">System Analytics</h3>
            <p className="text-sm text-slate-500 mb-4">
              Monitor active sessions, API throughput, and infrastructure performance.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">View Performance →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
