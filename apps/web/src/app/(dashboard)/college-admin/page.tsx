import React from 'react';
import Link from 'next/link';
import { Building, Users, BookOpen, Settings, LogOut } from 'lucide-react';

export default function CollegeAdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">UniLMS</h1>
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            College Admin Portal
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
        <h2 className="text-2xl font-bold text-slate-800 mb-6">College Administration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Department Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Departments</h3>
            <p className="text-sm text-slate-500 mb-4">
              Configure engineering branches, departments, semesters, and curriculum plans.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Configure Branches →</button>
          </div>

          {/* Card 2: Faculty Onboarding */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Faculty & HODs</h3>
            <p className="text-sm text-slate-500 mb-4">
              Onboard teachers, assign HOD roles, and manage class advisor designations.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Manage Staff →</button>
          </div>

          {/* Card 3: College Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Settings className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">College Settings</h3>
            <p className="text-sm text-slate-500 mb-4">
              Upload institutional logos, configure grading scales, and academic schedules.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Edit Profiles →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
