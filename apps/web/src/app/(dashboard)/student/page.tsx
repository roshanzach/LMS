import React from 'react';
import Link from 'next/link';
import { User, Award, BookOpen, Clock, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">UniLMS</h1>
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            Student Portal
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
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Student Center</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Course Materials */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Courses</h3>
            <p className="text-sm text-slate-500 mb-4">
              Access lecture syllabus material, course notes, and assignments.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">View Notes →</button>
          </div>

          {/* Card 2: Attendance Percentage */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Clock className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Attendance</h3>
            <p className="text-sm text-slate-500 mb-4">
              Monitor attendance percentage across all courses (minimum target: 75%).
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">View Attendance →</button>
          </div>

          {/* Card 3: OBE Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <Award className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">OBE Progress</h3>
            <p className="text-sm text-slate-500 mb-4">
              Check attained scores and outcomes based on Course Outcome targets.
            </p>
            <button className="text-sm font-bold text-blue-600 hover:underline">View Attainments →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
