'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Layers, BookOpen, Edit2, Loader2, RefreshCw, X, Eye } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  code: string;
  totalSemesters: number;
}

interface Scheme {
  id: string;
  name: string;
  university: string;
  effectiveYear: number;
  isActive: boolean;
  programId: string;
  program?: Program;
}

interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function SchemeManagement() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [selectedSchemeForSemesters, setSelectedSchemeForSemesters] = useState<Scheme | null>(null);
  
  // Semester list states
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('KTU');
  const [effectiveYear, setEffectiveYear] = useState<number>(new Date().getFullYear());
  const [programId, setProgramId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [schemesRes, progRes] = await Promise.all([
        fetch(`${API_BASE}/college-admin/schemes`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
        fetch(`${API_BASE}/college-admin/programs`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
      ]);

      if (!schemesRes.ok || !progRes.ok) {
        throw new Error('Failed to fetch schemes or programs.');
      }

      const schemesData = await schemesRes.json();
      const progData = await progRes.json();

      setSchemes(schemesData);
      setPrograms(progData);
      if (progData.length > 0) {
        setProgramId(progData[0].id);
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

  // Fetch semesters when viewing scheme details
  useEffect(() => {
    if (selectedSchemeForSemesters) {
      const fetchSemesters = async () => {
        setIsLoadingSemesters(true);
        try {
          const res = await fetch(`${API_BASE}/college-admin/schemes/${selectedSchemeForSemesters.id}/semesters`, {
            headers: { 'x-user-role': 'COLLEGE_ADMIN' }
          });
          if (!res.ok) throw new Error('Failed to load semesters');
          const data = await res.json();
          setSemesterList(data);
        } catch {
          setSemesterList([]);
        } finally {
          setIsLoadingSemesters(false);
        }
      };
      fetchSemesters();
    }
  }, [selectedSchemeForSemesters]);

  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setName('');
    setUniversity('KTU');
    setEffectiveYear(new Date().getFullYear());
    if (programs.length > 0) {
      setProgramId(programs[0].id);
    }
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: Scheme) => {
    setEditingScheme(sch);
    setName(sch.name);
    setUniversity(sch.university);
    setEffectiveYear(sch.effectiveYear);
    setProgramId(sch.programId);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !university.trim() || !programId) {
      setSubmitError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingScheme ? 'PATCH' : 'POST';
      const url = editingScheme
        ? `${API_BASE}/college-admin/schemes/${editingScheme.id}`
        : `${API_BASE}/college-admin/schemes`;

      const payload = {
        name: name.trim(),
        university: university.trim(),
        effectiveYear: Number(effectiveYear),
        programId,
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
      setSubmitError(err.message ?? 'Failed to save scheme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (sch: Scheme) => {
    try {
      const res = await fetch(`${API_BASE}/college-admin/schemes/${sch.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'COLLEGE_ADMIN'
        },
        body: JSON.stringify({ isActive: !sch.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Scheme & Regulation Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure academic regulation standards and automatically map semester templates.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scheme</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search schemes by name or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
          />
        </div>
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
            <span className="text-sm text-slate-500 font-semibold">Loading schemes...</span>
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
        ) : filteredSchemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Layers className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">No schemes registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">University</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Effective Year</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchemes.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{sch.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-800">{sch.university}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{sch.effectiveYear}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{sch.program?.name}</td>
                    <td className="px-6 py-4 text-xs">
                      <button
                        onClick={() => handleToggleActive(sch)}
                        className={`px-3 py-1 rounded-full font-bold transition
                          ${
                            sch.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {sch.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => setSelectedSchemeForSemesters(sch)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-950 transition inline-flex items-center justify-center gap-1 text-xs font-bold"
                        title="View Semesters"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Semesters</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sch)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center"
                        title="Edit scheme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingScheme ? 'Edit Scheme' : 'Add Scheme'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-medium">
                  {submitError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. KTU B.Tech 2024"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">University</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Effective Year</label>
                  <input
                    type="number"
                    required
                    value={effectiveYear}
                    onChange={(e) => setEffectiveYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              {!editingScheme && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Applicable Program</label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                  >
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Viewer Modal (Read-Only) */}
      {selectedSchemeForSemesters && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSchemeForSemesters(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Semester Structure</h3>
                <span className="text-xs font-semibold text-slate-400">Read-Only template for {selectedSchemeForSemesters.name}</span>
              </div>
              <button
                onClick={() => setSelectedSchemeForSemesters(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingSemesters ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
                </div>
              ) : semesterList.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm">No semesters generated under this scheme.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {semesterList.map((sem) => (
                    <div
                      key={sem.id}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm">
                        S{sem.semesterNumber}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">
                          SEMESTER
                        </span>
                        <span className="text-sm font-bold text-slate-800">{sem.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
