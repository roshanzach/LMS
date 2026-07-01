'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Trash2, Edit2, Loader2, RefreshCw } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
  degreeType: 'BTECH' | 'MTECH' | 'MCA';
  duration: number;
  totalSemesters: number;
  isActive: boolean;
  departmentId: string;
  department?: Department;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const DEGREE_LABELS = {
  BTECH: 'B.Tech',
  MTECH: 'M.Tech',
  MCA: 'MCA',
};

export default function ProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [degreeType, setDegreeType] = useState<'BTECH' | 'MTECH' | 'MCA'>('BTECH');
  const [duration, setDuration] = useState(4);
  const [departmentId, setDepartmentId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [programsRes, deptsRes] = await Promise.all([
        fetch(`${API_BASE}/college-admin/programs`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
        fetch(`${API_BASE}/college-admin/departments`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
      ]);
      
      if (!programsRes.ok || !deptsRes.ok) throw new Error('Failed to fetch programs or departments.');
      
      const programsData = await programsRes.json();
      const deptsData = await deptsRes.json();
      
      setPrograms(programsData);
      setDepartments(deptsData);
      if (deptsData.length > 0) {
        setDepartmentId(deptsData[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? 'An error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update default duration based on degree type
  useEffect(() => {
    if (degreeType === 'BTECH') {
      setDuration(4);
    } else {
      setDuration(2);
    }
  }, [degreeType]);

  const handleOpenAddModal = () => {
    setEditingProgram(null);
    setName('');
    setCode('');
    setDegreeType('BTECH');
    setDuration(4);
    if (departments.length > 0) {
      setDepartmentId(departments[0].id);
    }
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prog: Program) => {
    setEditingProgram(prog);
    setName(prog.name);
    setCode(prog.code);
    setDegreeType(prog.degreeType);
    setDuration(prog.duration);
    setDepartmentId(prog.departmentId);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !code.trim() || !departmentId) {
      setSubmitError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingProgram ? 'PATCH' : 'POST';
      const url = editingProgram
        ? `${API_BASE}/college-admin/programs/${editingProgram.id}`
        : `${API_BASE}/college-admin/programs`;

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        degreeType,
        duration,
        departmentId,
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'COLLEGE_ADMIN'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Operation failed');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to save program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (prog: Program) => {
    try {
      const res = await fetch(`${API_BASE}/college-admin/programs/${prog.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'COLLEGE_ADMIN'
        },
        body: JSON.stringify({ isActive: !prog.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    }
  };

  const handleArchive = async (prog: Program) => {
    if (!confirm(`Are you sure you want to deactivate program "${prog.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/programs/${prog.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'COLLEGE_ADMIN' }
      });
      if (!res.ok) throw new Error('Failed to deactivate program');
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to deactivate program');
    }
  };

  const filteredPrograms = programs.filter((prog) => {
    const matchesSearch =
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDeptFilter === '' || prog.departmentId === selectedDeptFilter;
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Program Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure, edit, and deactivate undergraduate and postgraduate programs.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Program</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
          />
        </div>
        
        {/* Dept Filter */}
        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchData}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
            <span className="text-sm text-slate-500 font-semibold">Loading programs...</span>
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
        ) : filteredPrograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">No programs found.</p>
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
                    Program Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Degree
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Semesters
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
                {filteredPrograms.map((prog) => (
                  <tr
                    key={prog.id}
                    className="hover:bg-slate-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-blue-800">
                      {prog.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {prog.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {DEGREE_LABELS[prog.degreeType] ?? prog.degreeType}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {prog.department?.name ?? 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {prog.duration} Years
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {prog.totalSemesters} Semesters
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <button
                        onClick={() => handleToggleActive(prog)}
                        className={`px-3 py-1 rounded-full font-bold transition
                          ${
                            prog.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {prog.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prog)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center"
                        title="Edit program"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(prog)}
                        className="p-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 hover:text-red-700 transition inline-flex items-center justify-center"
                        title="Deactivate Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProgram ? 'Edit Program' : 'Add Program'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Program Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science & Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Program Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. BTECH-CSE"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Degree Type
                  </label>
                  <select
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
                  >
                    <option value="BTECH">B.Tech (Undergraduate)</option>
                    <option value="MTECH">M.Tech (Postgraduate)</option>
                    <option value="MCA">MCA (Postgraduate)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Preview generated Semesters */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                  Automatic Semester Structure Preview
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from(
                    { length: degreeType === 'BTECH' ? 8 : 4 },
                    (_, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-150 text-center py-2 rounded-xl text-xs font-bold text-blue-900 shadow-sm"
                      >
                        S{i + 1}
                      </div>
                    ),
                  )}
                </div>
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
                    'Save Program'
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
