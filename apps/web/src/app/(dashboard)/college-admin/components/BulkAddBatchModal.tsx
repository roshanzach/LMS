'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2, Search, Plus, Trash2, CheckSquare, Square, MinusSquare,
  ChevronDown, X, CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Program {
  id: string;
  name: string;
  code: string;
  degreeType: 'BTECH' | 'MTECH' | 'MCA' | string;
  totalSemesters: number;
}

interface Scheme {
  id: string;
  name: string;
  university: string;
  programId: string;
}

interface Differentiator {
  id: string;
  value: string;
}

interface ProgramEntry {
  schemeId: string;
  differentiators: Differentiator[];
}

interface BulkAddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programs: Program[];
  schemes: Scheme[];
  getAuthHeaders: () => Record<string, string>;
  apiBase: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DIFFS = ['A', 'B'];

const DEGREE_LABELS: Record<string, string> = {
  BTECH: 'B.Tech',
  MTECH: 'M.Tech',
  MCA: 'MCA',
  MBA: 'MBA',
  BCA: 'BCA',
  ALL: 'All',
};

function makeDiffs(values = DEFAULT_DIFFS): Differentiator[] {
  return values.map((v) => ({ id: Math.random().toString(36).slice(2), value: v }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkAddBatchModal({
  isOpen,
  onClose,
  onSuccess,
  programs,
  schemes,
  getAuthHeaders,
  apiBase,
}: BulkAddBatchModalProps) {
  // Common form
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 4);
  const [status, setStatus] = useState<'UPCOMING' | 'ACTIVE'>('ACTIVE');

  // Degree filter
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');

  // Program selection
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [programData, setProgramData] = useState<Record<string, ProgramEntry>>({});
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Editing inline chip
  const [editingDiffId, setEditingDiffId] = useState<string | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────

  // Unique degree types from programs list
  const degreeTypes = ['ALL', ...Array.from(new Set(programs.map((p) => p.degreeType).filter(Boolean)))];

  // Programs visible in dropdown after degree filter
  const degreeFilteredPrograms = selectedDegree === 'ALL'
    ? programs
    : programs.filter((p) => p.degreeType === selectedDegree);

  // Programs visible after search filter
  const filteredPrograms = degreeFilteredPrograms.filter(
    (p) =>
      p.name.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(programSearchQuery.toLowerCase())
  );

  const isAllSelected =
    degreeFilteredPrograms.length > 0 &&
    degreeFilteredPrograms.every((p) => selectedProgramIds.includes(p.id));
  const isSomeSelected =
    degreeFilteredPrograms.some((p) => selectedProgramIds.includes(p.id)) && !isAllSelected;

  // ─── Effects ─────────────────────────────────────────────────────────────

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isDropdownOpen]);

  // Sync programData when selectedProgramIds changes
  useEffect(() => {
    setProgramData((prev) => {
      const next = { ...prev };
      // Remove deselected
      Object.keys(next).forEach((id) => {
        if (!selectedProgramIds.includes(id)) delete next[id];
      });
      // Add newly selected with auto-filled defaults
      selectedProgramIds.forEach((id) => {
        if (!next[id]) {
          const pSchemes = schemes.filter((s) => s.programId === id);
          next[id] = {
            schemeId: pSchemes.length > 0 ? pSchemes[0].id : '',
            differentiators: makeDiffs(),
          };
        }
      });
      return next;
    });
  }, [selectedProgramIds, schemes]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setStartYear(new Date().getFullYear());
      setEndYear(new Date().getFullYear() + 4);
      setStatus('ACTIVE');
      setSelectedDegree('ALL');
      setSelectedProgramIds([]);
      setProgramData({});
      setProgramSearchQuery('');
      setIsDropdownOpen(false);
      setSubmitError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const toggleProgram = (id: string) => {
    setSelectedProgramIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAllDegree = () => {
    const ids = degreeFilteredPrograms.map((p) => p.id);
    if (isAllSelected) {
      setSelectedProgramIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedProgramIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const updateScheme = (pid: string, schemeId: string) =>
    setProgramData((prev) => ({ ...prev, [pid]: { ...prev[pid], schemeId } }));

  const updateDiff = (pid: string, diffId: string, value: string) =>
    setProgramData((prev) => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        differentiators: prev[pid].differentiators.map((d) =>
          d.id === diffId ? { ...d, value } : d
        ),
      },
    }));

  const addDiff = (pid: string) =>
    setProgramData((prev) => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        differentiators: [
          ...prev[pid].differentiators,
          { id: Math.random().toString(36).slice(2), value: '' },
        ],
      },
    }));

  const removeDiff = (pid: string, diffId: string) =>
    setProgramData((prev) => {
      if (prev[pid].differentiators.length <= 1) return prev;
      return {
        ...prev,
        [pid]: {
          ...prev[pid],
          differentiators: prev[pid].differentiators.filter((d) => d.id !== diffId),
        },
      };
    });

  const removeProgram = (pid: string) =>
    setSelectedProgramIds((prev) => prev.filter((id) => id !== pid));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!name.trim()) { setSubmitError('Batch Name is required.'); return; }
    if (selectedProgramIds.length === 0) { setSubmitError('Select at least one program.'); return; }

    const payloadPrograms = [];
    for (const pid of selectedProgramIds) {
      const pData = programData[pid];
      if (!pData?.schemeId) {
        const pn = programs.find((p) => p.id === pid)?.name || 'Unknown';
        setSubmitError(`Select a Scheme for: ${pn}`); return;
      }
      const diffValues = pData.differentiators.map((d) => d.value.trim());
      if (diffValues.some((v) => !v)) {
        const pn = programs.find((p) => p.id === pid)?.name || 'Unknown';
        setSubmitError(`Class Differentiators cannot be empty for: ${pn}`); return;
      }
      if (new Set(diffValues).size !== diffValues.length) {
        const pn = programs.find((p) => p.id === pid)?.name || 'Unknown';
        setSubmitError(`Duplicate Class Differentiators found for: ${pn}`); return;
      }
      payloadPrograms.push({ programId: pid, schemeId: pData.schemeId, differentiators: diffValues });
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/college-admin/batches/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: name.trim(), startYear: Number(startYear), endYear: Number(endYear), status, programs: payloadPrograms }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Bulk batch creation failed');
      }
      const data = await res.json();
      setSuccessMessage(`✓ Successfully created ${data.count} batches.`);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to save batches.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  const totalBatches = selectedProgramIds.reduce(
    (sum, pid) => sum + (programData[pid]?.differentiators.length ?? 0), 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-3 pt-6"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-6xl flex flex-col mb-6 animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white rounded-t-3xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Bulk Create Batches</h3>
              <p className="text-xs text-slate-500 font-medium">Create batches across multiple programs in one shot.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalBatches > 0 && (
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} to create
              </span>
            )}
            <button onClick={onClose} disabled={isSubmitting} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-50 transition text-lg">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Body ── */}
          <div className="p-5 space-y-4">

            {/* Error / Success banners */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />{submitError}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{successMessage}
              </div>
            )}

            {/* ── Common Details ── */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Common Batch Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Batch Name <span className="text-red-500">*</span></label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 2026–2030"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Start Year <span className="text-red-500">*</span></label>
                  <input
                    type="number" required value={startYear} onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">End Year <span className="text-red-500">*</span></label>
                  <input
                    type="number" required value={endYear} onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <div className="flex gap-2">
                  {(['UPCOMING', 'ACTIVE'] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Degree Filter + Program Selector ── */}
            <div className="space-y-2">
              {/* Degree tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter by Degree:</span>
                {degreeTypes.map((dt) => {
                  const label = DEGREE_LABELS[dt] ?? dt;
                  const count = dt === 'ALL' ? programs.length : programs.filter(p => p.degreeType === dt).length;
                  return (
                    <button
                      key={dt} type="button" onClick={() => setSelectedDegree(dt)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        selectedDegree === dt
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {label} <span className={`ml-1 ${selectedDegree === dt ? 'text-blue-200' : 'text-slate-400'}`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Multi-select dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedProgramIds.length === 0
                      ? `Select programs from ${selectedDegree === 'ALL' ? 'all degrees' : DEGREE_LABELS[selectedDegree] ?? selectedDegree}...`
                      : `${selectedProgramIds.length} program${selectedProgramIds.length > 1 ? 's' : ''} selected`}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedProgramIds.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-md">{selectedProgramIds.length}</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden" style={{ maxHeight: '260px' }}>
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text" placeholder="Search programs..."
                          value={programSearchQuery} onChange={(e) => setProgramSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '208px' }}>
                      {/* Select all for current degree */}
                      <div
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                        onClick={(e) => { e.stopPropagation(); handleSelectAllDegree(); }}
                      >
                        <div className="text-blue-600">
                          {isAllSelected ? <CheckSquare className="w-4 h-4" /> : isSomeSelected ? <MinusSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          Select All {selectedDegree !== 'ALL' ? `(${DEGREE_LABELS[selectedDegree] ?? selectedDegree})` : ''}
                        </span>
                      </div>

                      {filteredPrograms.length === 0 ? (
                        <p className="text-xs text-slate-400 p-4 text-center">No programs found.</p>
                      ) : (
                        filteredPrograms.map((p) => (
                          <div
                            key={p.id}
                            className={`flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors ${selectedProgramIds.includes(p.id) ? 'bg-blue-50/50' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleProgram(p.id); }}
                          >
                            <div className={selectedProgramIds.includes(p.id) ? 'text-blue-600' : 'text-slate-300'}>
                              {selectedProgramIds.includes(p.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold flex-shrink-0">{p.code}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Program Cards ── */}
            {selectedProgramIds.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Program Configurations
                  </h4>
                  <span className="text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{selectedProgramIds.length}</span> programs, <span className="font-bold text-slate-800">{totalBatches}</span> batches
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedProgramIds.map((pid) => {
                    const prog = programs.find((p) => p.id === pid);
                    const pData = programData[pid];
                    const pSchemes = schemes.filter((s) => s.programId === pid);
                    if (!prog || !pData) return null;

                    return (
                      <div key={pid} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs leading-tight truncate">{prog.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-slate-400 font-semibold">{prog.code}</span>
                              {prog.degreeType && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                                  {DEGREE_LABELS[prog.degreeType] ?? prog.degreeType}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button" onClick={() => removeProgram(pid)}
                            className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 p-0.5 rounded-lg hover:bg-red-50"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Scheme */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Scheme <span className="text-red-500">*</span></label>
                          <select
                            value={pData.schemeId}
                            onChange={(e) => updateScheme(pid, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-xs font-semibold"
                          >
                            <option value="">Select Scheme</option>
                            {pSchemes.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Class Differentiators as chips */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-500">Sections <span className="text-red-500">*</span></label>
                            <button
                              type="button" onClick={() => addDiff(pid)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>

                          {/* Chips row */}
                          <div className="flex flex-wrap gap-1.5">
                            {pData.differentiators.map((diff) => (
                              <div
                                key={diff.id}
                                className={`group flex items-center gap-1 rounded-full border text-xs font-bold transition-all ${
                                  editingDiffId === diff.id
                                    ? 'border-blue-400 bg-blue-50 px-1 py-0.5'
                                    : 'border-slate-200 bg-slate-50 px-2.5 py-1 hover:border-slate-300'
                                }`}
                              >
                                {editingDiffId === diff.id ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={diff.value}
                                    onChange={(e) => updateDiff(pid, diff.id, e.target.value)}
                                    onBlur={() => setEditingDiffId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') { e.preventDefault(); setEditingDiffId(null); }
                                    }}
                                    className="w-12 bg-transparent focus:outline-none text-blue-700 font-bold text-xs text-center"
                                    style={{ minWidth: `${Math.max(diff.value.length, 2) + 1}ch` }}
                                  />
                                ) : (
                                  <span
                                    className="text-slate-700 cursor-pointer min-w-[1ch] text-center"
                                    onClick={() => setEditingDiffId(diff.id)}
                                    title="Click to rename"
                                  >
                                    {diff.value || <span className="text-slate-300 italic">empty</span>}
                                  </span>
                                )}
                                {pData.differentiators.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeDiff(pid, diff.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-medium">Click a chip to rename it.</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {selectedProgramIds.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <Square className="w-8 h-8 mb-2 text-slate-200" />
                <p className="text-sm font-semibold">No programs selected yet.</p>
                <p className="text-xs mt-0.5">Use the selector above to pick programs.</p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-t border-slate-200 rounded-b-3xl sticky bottom-0 z-10">
            <p className="text-xs text-slate-500 font-medium">
              {totalBatches > 0 ? (
                <><span className="font-bold text-slate-800">{totalBatches}</span> batch records will be created.</>
              ) : 'Select programs and configure sections to preview.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={onClose} disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedProgramIds.length === 0}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition disabled:opacity-60 flex items-center justify-center gap-2 min-w-[130px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
                ) : (
                  `Save ${totalBatches > 0 ? totalBatches : ''} Batch${totalBatches !== 1 ? 'es' : ''}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
