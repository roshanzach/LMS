'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function AddStudentModal({ onClose, onSuccess }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [batchYear, setBatchYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(`Successfully added student ${name} (${enrollmentNo})!`);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="student-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Krishnan's Student"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              />
            </div>

            {/* Enrollment */}
            <div className="space-y-1.5">
              <label htmlFor="student-enrollment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enrollment Number
              </label>
              <input
                id="student-enrollment"
                type="text"
                required
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="CS2026001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="student-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="student-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="student-dept" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Department
              </label>
              <select
                id="student-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            {/* Batch Year */}
            <div className="space-y-1.5">
              <label htmlFor="student-batch" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Batch Year
              </label>
              <input
                id="student-batch"
                type="number"
                required
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                placeholder="2026"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              />
            </div>

            {/* Semester */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="student-sem" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Semester
              </label>
              <select
                id="student-sem"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-55"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4" />
                  Save Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
