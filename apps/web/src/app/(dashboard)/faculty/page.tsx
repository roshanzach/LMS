import React from 'react';
import Link from 'next/link';
import { BookOpen, Percent, GitFork, BarChart, LogOut } from 'lucide-react';

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">UniLMS</h1>
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            Faculty Portal
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
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Course Delivery & Grading</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Assigned Courses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Courses</h3>
            <p className="text-sm text-slate-500 mb-4">
              Access lesson plans, student rosters, lecture notes, and study material.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Open Courses →</button>
          </div>

          {/* Card 2: CO-PO Mapping */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <GitFork className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">CO-PO Mapping</h3>
            <p className="text-sm text-slate-500 mb-4">
              Map Course Outcomes (CO) to Program Outcomes (PO) mapping matrices.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Edit Matrices →</button>
          </div>

          {/* Card 3: Marks Entry */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Percent className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Internal Assessment</h3>
            <p className="text-sm text-slate-500 mb-4">
              Input scores for internal assessment tests, assignments, and quizzes.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">Enter Grades →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
