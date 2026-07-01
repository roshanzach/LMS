'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Edit2, Power, Loader2, RefreshCw } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch departments from correct endpoint
      const res = await fetch(`${API_BASE}/college-admin/departments`);
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);

      // 2. Fetch colleges to populate creation dropdown
      // (Normally college is bound to the logged-in admin, here we list to fetch the collegeId)
      // Since colleges endpoint might not exist, we attempt a generic fetch or fallback
      const collegeListRes = await fetch(`${API_BASE}/super-admin/college-admins`);
      if (collegeListRes.ok) {
        const admins = await collegeListRes.json();
        // Fallback: extract college names or setup if available
        // To be safe, we can use the collegeId from any existing department, or fallback
        if (data.length > 0) {
          setCollegeId(data[0].collegeId);
        } else {
          // If no departments exist, we create a test college to obtain an ID
          const setupRes = await fetch(`${API_BASE}/college-admin/departments/test-setup`, { method: 'POST' });
          if (setupRes.ok) {
            const defaultCollege = await setupRes.json();
            setCollegeId(defaultCollege.id);
            setColleges([defaultCollege]);
          }
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'An error occurred while loading departments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setCollegeId(dept.collegeId);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !code.trim() || !collegeId) {
      setSubmitError('Name, Code and College selection are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = editingDept
        ? `${API_BASE}/college-admin/departments/${editingDept.id}`
        : `${API_BASE}/college-admin/departments`;
      const method = editingDept ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'COLLEGE_ADMIN'
        },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          collegeId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Failed to save department');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (dept: Department) => {
    if (!confirm(`Are you sure you want to deactivate department "${dept.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/departments/${dept.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'COLLEGE_ADMIN' }
      });
      if (!res.ok) throw new Error('Failed to deactivate department');
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to deactivate department');
    }
  };

  const filteredDepts = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Department Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure and manage the academic departments of your college.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
          />
        </div>
        <button
          onClick={fetchData}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
          title="Refresh departments"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
            <span className="text-sm text-slate-500 font-semibold">Loading departments...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 border border-blue-200 hover:bg-blue-50/50 rounded-xl px-4 py-2 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Building2 className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">No departments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepts.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-blue-800">
                      {dept.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(dept)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center"
                        title="Edit department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(dept)}
                        className="p-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 hover:text-red-700 transition inline-flex items-center justify-center"
                        title="Deactivate Department"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-medium">
                  {submitError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Department'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
