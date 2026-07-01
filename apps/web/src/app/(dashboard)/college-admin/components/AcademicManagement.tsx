'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, FolderHeart, GraduationCap, Loader2, RefreshCw, Layers } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
}

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

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  programId: string;
  schemeId: string;
  program?: Program;
  scheme?: Scheme;
}

interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
  programId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export default function AcademicManagement() {
  const [activeTab, setActiveTab] = useState<'schemes' | 'batches' | 'semesters'>('schemes');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Scheme Form
  const [schemeName, setSchemeName] = useState('');
  const [schemeUniversity, setSchemeUniversity] = useState('KTU');
  const [schemeYear, setSchemeYear] = useState<number>(new Date().getFullYear());
  const [schemeProgramId, setSchemeProgramId] = useState('');

  // Batch Form
  const [batchName, setBatchName] = useState('');
  const [batchStartYear, setBatchStartYear] = useState<number>(new Date().getFullYear());
  const [batchEndYear, setBatchEndYear] = useState<number>(new Date().getFullYear() + 4);
  const [batchProgramId, setBatchProgramId] = useState('');
  const [batchSchemeId, setBatchSchemeId] = useState('');

  // Semester Viewer states
  const [selectedSemesterSchemeId, setSelectedSemesterSchemeId] = useState('');
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [progRes, schemeRes, batchRes] = await Promise.all([
        fetch(`${API_BASE}/programs`),
        fetch(`${API_BASE}/schemes`),
        fetch(`${API_BASE}/batches`),
      ]);

      if (!progRes.ok || !schemeRes.ok || !batchRes.ok) {
        throw new Error('Failed to load academic records.');
      }

      const progData = await progRes.json();
      const schemeData = await schemeRes.json();
      const batchData = await batchRes.json();

      setPrograms(progData);
      setSchemes(schemeData);
      setBatches(batchData);

      if (progData.length > 0) {
        setSchemeProgramId(progData[0].id);
        setBatchProgramId(progData[0].id);
      }
      if (schemeData.length > 0) {
        setSelectedSemesterSchemeId(schemeData[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? 'An error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync batch form schemes list when program changes
  useEffect(() => {
    const programSchemes = schemes.filter((s) => s.programId === batchProgramId);
    if (programSchemes.length > 0) {
      setBatchSchemeId(programSchemes[0].id);
    } else {
      setBatchSchemeId('');
    }
  }, [batchProgramId, schemes]);

  // Fetch semesters when selecting a scheme in Semester tab
  useEffect(() => {
    if (activeTab === 'semesters' && selectedSemesterSchemeId) {
      const loadSemesters = async () => {
        setIsLoadingSemesters(true);
        try {
          const res = await fetch(`${API_BASE}/schemes/${selectedSemesterSchemeId}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setSemesterList(data.semesters ?? []);
        } catch {
          setSemesterList([]);
        } finally {
          setIsLoadingSemesters(false);
        }
      };
      loadSemesters();
    }
  }, [selectedSemesterSchemeId, activeTab]);

  const handleSchemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!schemeName.trim() || !schemeUniversity.trim() || !schemeProgramId) {
      setSubmitError('All fields are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schemeName.trim(),
          university: schemeUniversity.trim(),
          effectiveYear: Number(schemeYear),
          programId: schemeProgramId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message ?? 'Failed to save scheme');
      }
      setSchemeName('');
      setIsSchemeModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      setSubmitError(err.message ?? 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!batchName.trim() || !batchProgramId || !batchSchemeId) {
      setSubmitError('All fields are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: batchName.trim(),
          startYear: Number(batchStartYear),
          endYear: Number(batchEndYear),
          programId: batchProgramId,
          schemeId: batchSchemeId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message ?? 'Failed to save batch');
      }
      setBatchName('');
      setIsBatchModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      setSubmitError(err.message ?? 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters
  const filteredSchemes = schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.university.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.program?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Academic Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure schemes, student batches, and view auto-generated semester mappings.
          </p>
        </div>
        
        {activeTab === 'schemes' && (
          <button
            onClick={() => setIsSchemeModalOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scheme</span>
          </button>
        )}

        {activeTab === 'batches' && (
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => {
            setActiveTab('schemes');
            setSearchQuery('');
          }}
          className={`pb-4 text-sm font-bold border-b-2 transition duration-150 ${
            activeTab === 'schemes'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Schemes (Regulations)
        </button>

        <button
          onClick={() => {
            setActiveTab('batches');
            setSearchQuery('');
          }}
          className={`pb-4 text-sm font-bold border-b-2 transition duration-150 ${
            activeTab === 'batches'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Batches
        </button>

        <button
          onClick={() => {
            setActiveTab('semesters');
            setSearchQuery('');
          }}
          className={`pb-4 text-sm font-bold border-b-2 transition duration-150 ${
            activeTab === 'semesters'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Semesters (Auto-Generated)
        </button>
      </div>

      {/* Control bar */}
      {activeTab !== 'semesters' && (
        <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
            />
          </div>
          <button
            onClick={fetchAllData}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Container */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
            <span className="text-sm text-slate-500 font-semibold">Loading data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchAllData}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 border border-blue-200 hover:bg-blue-50/50 rounded-xl px-4 py-2 transition"
            >
              Reload
            </button>
          </div>
        ) : activeTab === 'schemes' ? (
          /* Schemes Table */
          filteredSchemes.length === 0 ? (
            <p className="text-center py-10 text-slate-400 font-medium text-sm">No schemes registered.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">University</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Effective Year</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicable Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchemes.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{sch.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-800">{sch.university}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{sch.effectiveYear}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{sch.program?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'batches' ? (
          /* Batches Table */
          filteredBatches.length === 0 ? (
            <p className="text-center py-10 text-slate-400 font-medium text-sm">No batches registered.</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Semester Viewer tab */
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <label className="text-sm font-bold text-slate-700">Select Scheme:</label>
              <select
                value={selectedSemesterSchemeId}
                onChange={(e) => setSelectedSemesterSchemeId(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
              >
                {schemes.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name} ({sch.program?.name})
                  </option>
                ))}
              </select>
            </div>

            {isLoadingSemesters ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
              </div>
            ) : semesterList.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm">No semesters found for this program.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {semesterList.map((sem) => (
                  <div
                    key={sem.id}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      S{sem.semesterNumber}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-extrabold block">
                        SEMESTER
                      </span>
                      <span className="text-sm font-bold text-slate-800">{sem.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Scheme Modal */}
      {isSchemeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSchemeModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Scheme</h3>
              <button
                onClick={() => setIsSchemeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSchemeSubmit} className="p-6 space-y-4">
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
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
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
                    value={schemeUniversity}
                    onChange={(e) => setSchemeUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Effective Year</label>
                  <input
                    type="number"
                    required
                    value={schemeYear}
                    onChange={(e) => setSchemeYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Applicable Program</label>
                <select
                  value={schemeProgramId}
                  onChange={(e) => setSchemeProgramId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                >
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSchemeModalOpen(false)}
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

      {/* Add Batch Modal */}
      {isBatchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBatchModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Batch</h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
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
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
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
                    value={batchStartYear}
                    onChange={(e) => setBatchStartYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">End Year</label>
                  <input
                    type="number"
                    required
                    value={batchEndYear}
                    onChange={(e) => setBatchEndYear(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Program</label>
                <select
                  value={batchProgramId}
                  onChange={(e) => setBatchProgramId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
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
                  value={batchSchemeId}
                  onChange={(e) => setBatchSchemeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                >
                  {schemes
                    .filter((s) => s.programId === batchProgramId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.university})
                      </option>
                    ))}
                  {schemes.filter((s) => s.programId === batchProgramId).length === 0 && (
                    <option value="">No Schemes registered for this program</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !batchSchemeId}
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
