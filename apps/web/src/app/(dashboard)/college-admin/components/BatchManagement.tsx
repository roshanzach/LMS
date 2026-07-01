'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, GraduationCap, Loader2, RefreshCw, Edit2, Power } from 'lucide-react';

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
  programId: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'GRADUATED' | 'ARCHIVED';
  programId: string;
  schemeId: string;
  program?: Program;
  scheme?: Scheme;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const STATUS_LABELS = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  GRADUATED: 'Graduated',
  ARCHIVED: 'Archived',
};

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 4);
  const [programId, setProgramId] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE' | 'GRADUATED' | 'ARCHIVED'>('ACTIVE');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [batchesRes, progRes, schemesRes] = await Promise.all([
        fetch(`${API_BASE}/college-admin/batches`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
        fetch(`${API_BASE}/college-admin/programs`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
        fetch(`${API_BASE}/college-admin/schemes`, { headers: { 'x-user-role': 'COLLEGE_ADMIN' } }),
      ]);

      if (!batchesRes.ok || !progRes.ok || !schemesRes.ok) {
        throw new Error('Failed to fetch academic batch records.');
      }

      const batchesData = await batchesRes.json();
      const progData = await progRes.json();
      const schemesData = await schemesRes.json();

      setBatches(batchesData);
      setPrograms(progData);
      setSchemes(schemesData);

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

  // Filter schemes when selected program changes inside the form
  useEffect(() => {
    const filtered = schemes.filter((s) => s.programId === programId);
    if (filtered.length > 0) {
      setSchemeId(filtered[0].id);
    } else {
      setSchemeId('');
    }
  }, [programId, schemes]);

  const handleOpenAddModal = () => {
    setEditingBatch(null);
    setName('');
    setStartYear(new Date().getFullYear());
    setEndYear(new Date().getFullYear() + 4);
    if (programs.length > 0) {
      setProgramId(programs[0].id);
    }
    setStatus('ACTIVE');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setName(batch.name);
    setStartYear(batch.startYear);
    setEndYear(batch.endYear);
    setProgramId(batch.programId);
    setSchemeId(batch.schemeId);
    setStatus(batch.status);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!name.trim() || !programId || !schemeId) {
      setSubmitError('All fields are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = editingBatch ? 'PATCH' : 'POST';
      const url = editingBatch
        ? `${API_BASE}/college-admin/batches/${editingBatch.id}`
        : `${API_BASE}/college-admin/batches`;

      const payload = {
        name: name.trim(),
        startYear: Number(startYear),
        endYear: Number(endYear),
        programId,
        schemeId,
        status,
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
      setSubmitError(err.message ?? 'Failed to save batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (batch: Batch) => {
    if (!confirm(`Are you sure you want to archive batch "${batch.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/batches/${batch.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'COLLEGE_ADMIN'
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (!res.ok) throw new Error('Failed to archive batch');
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to archive batch');
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.program?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.scheme?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Batch Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure academic cohorts, align regulations, and track graduation lifecycles.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Batch</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batches by name or program..."
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
            <span className="text-sm text-slate-500 font-semibold">Loading batches...</span>
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
        ) : filteredBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-sm">No batches registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Start Year</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">End Year</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme / Regulation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((bat) => (
                  <tr key={bat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{bat.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{bat.startYear}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{bat.endYear}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{bat.program?.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-800">{bat.scheme?.name}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-bold
                        ${bat.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : ''}
                        ${bat.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700' : ''}
                        ${bat.status === 'GRADUATED' ? 'bg-slate-100 text-slate-600' : ''}
                        ${bat.status === 'ARCHIVED' ? 'bg-red-50 text-red-700' : ''}
                      `}>
                        {STATUS_LABELS[bat.status] ?? bat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(bat)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center"
                        title="Edit batch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {bat.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchive(bat)}
                          className="p-1.5 rounded-lg border border-red-50 hover:bg-red-50 text-red-500 hover:text-red-700 transition inline-flex items-center justify-center"
                          title="Archive Batch"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
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
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBatch ? 'Edit Batch' : 'Add Batch'}
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Batch Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2024–2028"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Start Year</label>
                  <input
                    type="number"
                    required
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">End Year</label>
                  <input
                    type="number"
                    required
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Program</label>
                <select
                  value={programId}
                  disabled={!!editingBatch}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold disabled:opacity-60"
                >
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Scheme / Regulation</label>
                <select
                  value={schemeId}
                  disabled={!!editingBatch}
                  onChange={(e) => setSchemeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold disabled:opacity-60"
                >
                  {schemes
                    .filter((s) => s.programId === programId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.university})
                      </option>
                    ))}
                  {schemes.filter((s) => s.programId === programId).length === 0 && (
                    <option value="">No Schemes registered for this program</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Batch Lifecycle Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
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
                  disabled={isSubmitting || !schemeId}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition min-w-[120px] disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
