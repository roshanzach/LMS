'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Building2,
  Edit2,
  Power,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Trash2,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  _count?: {
    programs: number;
  };
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
  deletedAt?: string | null;
  createdAt: string;
  _count?: {
    schemes: number;
  };
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
  classroom?: string | null;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'GRADUATED' | 'ARCHIVED';
  programId: string;
  schemeId: string;
  scheme?: Scheme;
  deletedAt?: string | null;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  batchId: string;
  semesterNumber: number;
  title: string;
  date: string;
  type: string; // "EXAM" | "HOLIDAY" | "EVENT"
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const DEGREE_LABELS = {
  BTECH: 'B.Tech',
  MTECH: 'M.Tech',
  MCA: 'MCA',
};

const BATCH_STATUS_LABELS = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  GRADUATED: 'Graduated',
  ARCHIVED: 'Archived',
};

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getAuthHeaders = () => {
    let headers: Record<string, string> = { 'x-user-role': 'COLLEGE_ADMIN' };
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        headers['x-user-role'] = user.role;
        if (user.username) headers['x-username'] = user.username;
      }
    }
    return headers;
  };

  // ─── DRILL-DOWN PATH STATES ──────────────────────────────────────────
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Programs Level State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [programSearchQuery, setProgramSearchQuery] = useState('');

  // Batches Level State
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);
  const [batchSearchQuery, setBatchSearchQuery] = useState('');
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);

  // Academic Calendar Level State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // ─── MODAL & FORM STATES ──────────────────────────────────────────────
  // Department Form
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [submitDeptError, setSubmitDeptError] = useState<string | null>(null);

  // Program Form
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progDegreeType, setProgDegreeType] = useState<'BTECH' | 'MTECH' | 'MCA'>('BTECH');
  const [progDuration, setProgDuration] = useState(4);
  const [progTotalSemesters, setProgTotalSemesters] = useState(8);
  const [isSubmittingProg, setIsSubmittingProg] = useState(false);
  const [submitProgError, setSubmitProgError] = useState<string | null>(null);
  const [progDepartmentId, setProgDepartmentId] = useState('');

  // Batch Form
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchName, setBatchName] = useState('');
  const [batchStartYear, setBatchStartYear] = useState<number>(new Date().getFullYear());
  const [batchEndYear, setBatchEndYear] = useState<number>(new Date().getFullYear() + 4);
  const [batchClassroom, setBatchClassroom] = useState('');
  const [batchSchemeId, setBatchSchemeId] = useState('');
  const [batchStatus, setBatchStatus] = useState<Batch['status']>('ACTIVE');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [submitBatchError, setSubmitBatchError] = useState<string | null>(null);

  // Calendar Event Form
  const [calTitle, setCalTitle] = useState('');
  const [calDate, setCalDate] = useState('');
  const [calType, setCalType] = useState('EVENT'); // "EVENT" | "EXAM" | "HOLIDAY"
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [submitEventError, setSubmitEventError] = useState<string | null>(null);

  // ─── FETCH LOGIC ──────────────────────────────────────────────────────
  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/college-admin/departments`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);

      if (data.length > 0) {
        setCollegeId(data[0].collegeId);
      } else if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.collegeId) setCollegeId(user.collegeId);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'An error occurred while loading departments.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async (deptId: string) => {
    setIsLoadingPrograms(true);
    setProgramsError(null);
    try {
      const res = await fetch(`${API_BASE}/college-admin/programs?departmentId=${deptId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      setPrograms(data);
    } catch (err: any) {
      setProgramsError(err.message ?? 'Failed to load programs.');
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const fetchBatchesAndSchemes = async (progId: string) => {
    setIsLoadingBatches(true);
    setBatchesError(null);
    try {
      const [batchesRes, schemesRes] = await Promise.all([
        fetch(`${API_BASE}/college-admin/batches?programId=${progId}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE}/college-admin/schemes?programId=${progId}`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!batchesRes.ok || !schemesRes.ok) throw new Error('Failed to fetch batch records.');

      const batchesData = await batchesRes.json();
      const schemesData = await schemesRes.json();

      setBatches(batchesData);
      setAllSchemes(schemesData);
      
      if (schemesData.length > 0) {
        setBatchSchemeId(schemesData[0].id);
      } else {
        setBatchSchemeId('');
      }
    } catch (err: any) {
      setBatchesError(err.message ?? 'An error occurred while loading batch data.');
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const fetchCalendarEvents = async (batchId: string, semNo: number) => {
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const res = await fetch(`${API_BASE}/college-admin/batches/${batchId}/semesters/${semNo}/calendar`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load academic calendar events.');
      const data = await res.json();
      setCalendarEvents(data);
    } catch (err: any) {
      setEventsError(err.message ?? 'An error occurred while fetching events.');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // ─── EFFECTS ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPrograms(selectedDepartment.id);
      // Reset lower levels
      setSelectedProgram(null);
      setSelectedBatch(null);
      setSelectedSemester(null);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedProgram) {
      fetchBatchesAndSchemes(selectedProgram.id);
      // Reset lower levels
      setSelectedBatch(null);
      setSelectedSemester(null);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedBatch) {
      setSelectedSemester(null);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedBatch && selectedSemester !== null) {
      fetchCalendarEvents(selectedBatch.id, selectedSemester);
    }
  }, [selectedBatch, selectedSemester]);

  // Adjust semesters count based on duration input
  useEffect(() => {
    if (!editingProg) {
      setProgTotalSemesters(progDegreeType === 'BTECH' ? 8 : progDuration * 2);
    }
  }, [progDuration, progDegreeType, editingProg]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────

  // Department CRUD
  const handleOpenAddDeptModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setSubmitDeptError(null);
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDeptModal = (e: React.MouseEvent, dept: Department) => {
    e.stopPropagation();
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setSubmitDeptError(null);
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitDeptError(null);
    if (!deptName.trim() || !deptCode.trim() || !collegeId) {
      setSubmitDeptError('Name, Code and College selection are required');
      return;
    }
    setIsSubmittingDept(true);
    try {
      const url = editingDept
        ? `${API_BASE}/college-admin/departments/${editingDept.id}`
        : `${API_BASE}/college-admin/departments`;
      const method = editingDept ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: deptName.trim(),
          code: deptCode.trim().toUpperCase(),
          collegeId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Failed to save department');
      }

      setIsDeptModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setSubmitDeptError(err.message ?? 'Failed to save department.');
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleDeactivateDept = async (e: React.MouseEvent, dept: Department) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to deactivate department "${dept.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/departments/${dept.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to deactivate department');
      fetchDepartments();
    } catch (err: any) {
      alert(err.message ?? 'Failed to deactivate department');
    }
  };

  // Program CRUD
  const handleOpenAddProgModal = () => {
    if (selectedDepartment) {
      setProgDepartmentId(selectedDepartment.id);
    } else if (departments.length > 0) {
      setProgDepartmentId(departments[0].id);
    }
    setEditingProg(null);
    setProgName('');
    setProgCode('');
    setProgDegreeType('BTECH');
    setProgDuration(4);
    setProgTotalSemesters(8);
    setSubmitProgError(null);
    setIsProgModalOpen(true);
  };

  const handleOpenEditProgModal = (e: React.MouseEvent, prog: Program) => {
    e.stopPropagation();
    setEditingProg(prog);
    setProgName(prog.name);
    setProgCode(prog.code);
    setProgDegreeType(prog.degreeType);
    setProgDuration(prog.duration);
    setProgTotalSemesters(prog.totalSemesters);
    setProgDepartmentId(prog.departmentId);
    setSubmitProgError(null);
    setIsProgModalOpen(true);
  };

  const handleProgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitProgError(null);
    if (!progDepartmentId) return;
    if (!progName.trim() || !progCode.trim()) {
      setSubmitProgError('All fields are required.');
      return;
    }

    setIsSubmittingProg(true);
    try {
      const method = editingProg ? 'PATCH' : 'POST';
      const url = editingProg
        ? `${API_BASE}/college-admin/programs/${editingProg.id}`
        : `${API_BASE}/college-admin/programs`;

      const payload = {
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        degreeType: progDegreeType,
        duration: progDuration,
        totalSemesters: Number(progTotalSemesters),
        departmentId: progDepartmentId,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Operation failed');
      }

      setIsProgModalOpen(false);
      fetchPrograms(selectedDepartment.id);
      fetchDepartments(); // Update counters
    } catch (err: any) {
      setSubmitProgError(err.message ?? 'Failed to save program.');
    } finally {
      setIsSubmittingProg(false);
    }
  };

  const handleArchiveProg = async (e: React.MouseEvent, prog: Program) => {
    e.stopPropagation();
    if (!selectedDepartment) return;
    if (!confirm(`Are you sure you want to deactivate program "${prog.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/programs/${prog.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to deactivate program');
      fetchPrograms(selectedDepartment.id);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message ?? 'Failed to deactivate program');
    }
  };

  const handleToggleActiveProg = async (e: React.MouseEvent, prog: Program) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/college-admin/programs/${prog.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isActive: !prog.isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle program status');
      if (selectedDepartment) {
        fetchPrograms(selectedDepartment.id);
      }
    } catch (err: any) {
      alert(err.message ?? 'Failed to toggle program status');
    }
  };

  // Batch CRUD
  const handleOpenAddBatchModal = () => {
    setEditingBatch(null);
    setBatchName('');
    setBatchStartYear(new Date().getFullYear());
    setBatchEndYear(new Date().getFullYear() + 4);
    setBatchClassroom('');
    setBatchStatus('ACTIVE');
    if (allSchemes.length > 0) {
      setBatchSchemeId(allSchemes[0].id);
    } else {
      setBatchSchemeId('');
    }
    setSubmitBatchError(null);
    setIsBatchModalOpen(true);
  };

  const handleOpenEditBatchModal = (e: React.MouseEvent, b: Batch) => {
    e.stopPropagation();
    setEditingBatch(b);
    setBatchName(b.name);
    setBatchStartYear(b.startYear);
    setBatchEndYear(b.endYear);
    setBatchClassroom(b.classroom ?? '');
    setBatchSchemeId(b.schemeId);
    setBatchStatus(b.status);
    setSubmitBatchError(null);
    setIsBatchModalOpen(true);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitBatchError(null);
    if (!selectedProgram) return;
    if (!batchName.trim() || !batchSchemeId) {
      setSubmitBatchError('Name and Scheme selection are required.');
      return;
    }

    setIsSubmittingBatch(true);
    try {
      const method = editingBatch ? 'PATCH' : 'POST';
      const url = editingBatch
        ? `${API_BASE}/college-admin/batches/${editingBatch.id}`
        : `${API_BASE}/college-admin/batches`;

      const payload = {
        name: batchName.trim(),
        startYear: Number(batchStartYear),
        endYear: Number(batchEndYear),
        classroom: batchClassroom.trim() || null,
        schemeId: batchSchemeId,
        programId: selectedProgram.id,
        status: batchStatus,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Operation failed');
      }

      setIsBatchModalOpen(false);
      fetchBatchesAndSchemes(selectedProgram.id);
    } catch (err: any) {
      setSubmitBatchError(err.message ?? 'Failed to save batch.');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleArchiveBatch = async (e: React.MouseEvent, b: Batch) => {
    e.stopPropagation();
    if (!selectedProgram) return;
    if (!confirm(`Are you sure you want to archive batch "${b.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/batches/${b.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (!res.ok) throw new Error('Failed to archive batch');
      fetchBatchesAndSchemes(selectedProgram.id);
    } catch (err: any) {
      alert(err.message ?? 'Failed to archive batch');
    }
  };

  // Calendar Event CRUD
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitEventError(null);
    if (!selectedBatch || selectedSemester === null) return;
    if (!calTitle.trim() || !calDate || !calType) {
      setSubmitEventError('All fields are required.');
      return;
    }

    setIsSubmittingEvent(true);
    try {
      const res = await fetch(`${API_BASE}/college-admin/batches/${selectedBatch.id}/semesters/${selectedSemester}/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: calTitle.trim(),
          date: calDate,
          type: calType,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message ?? 'Failed to create calendar event.');
      }

      setCalTitle('');
      setCalDate('');
      fetchCalendarEvents(selectedBatch.id, selectedSemester);
    } catch (err: any) {
      setSubmitEventError(err.message ?? 'Failed to save event.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!selectedBatch || selectedSemester === null) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/batches/calendar/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete event');
      fetchCalendarEvents(selectedBatch.id, selectedSemester);
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete event');
    }
  };

  // ─── FILTER CALCULATIONS ──────────────────────────────────────────────
  const filteredDepts = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrograms = programs.filter(
    (prog) =>
      prog.name.toLowerCase().includes(programSearchQuery.toLowerCase()) ||
      prog.code.toLowerCase().includes(programSearchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
      (b.classroom && b.classroom.toLowerCase().includes(batchSearchQuery.toLowerCase()))
  );

  // ─── BREADCRUMB RENDERING ─────────────────────────────────────────────
  const renderBreadcrumbs = () => {
    return (
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm text-sm font-semibold mb-6">
        <button
          onClick={() => {
            setSelectedDepartment(null);
            setSelectedProgram(null);
            setSelectedBatch(null);
            setSelectedSemester(null);
          }}
          className={`flex items-center gap-1.5 transition ${
            !selectedDepartment ? 'text-blue-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments</span>
        </button>

        {selectedDepartment && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-350" />
            <button
              onClick={() => {
                setSelectedProgram(null);
                setSelectedBatch(null);
                setSelectedSemester(null);
              }}
              className={`transition ${
                !selectedProgram ? 'text-blue-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {selectedDepartment.name}
            </button>
          </>
        )}

        {selectedProgram && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-350" />
            <button
              onClick={() => {
                setSelectedBatch(null);
                setSelectedSemester(null);
              }}
              className={`transition ${
                !selectedBatch ? 'text-blue-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {selectedProgram.name}
            </button>
          </>
        )}

        {selectedBatch && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-350" />
            <button
              onClick={() => {
                setSelectedSemester(null);
              }}
              className={`transition ${
                selectedSemester === null ? 'text-blue-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {selectedBatch.name} {selectedBatch.classroom ? `(${selectedBatch.classroom})` : ''}
            </button>
          </>
        )}

        {selectedSemester !== null && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-350" />
            <span className="text-slate-800 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              S{selectedSemester} Calendar
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Breadcrumbs Header */}
      {renderBreadcrumbs()}

      {/* ─── LEVEL 0: DEPARTMENTS LIST ───────────────────────────────────────── */}
      {!selectedDepartment && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Department & Institutional Config
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Create departments and drill down to manage programs, student batches, and calendars.
              </p>
            </div>
            <button
              onClick={handleOpenAddDeptModal}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={fetchDepartments}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
                <span className="text-sm text-slate-500 font-semibold">Loading departments...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <p className="text-red-600 font-semibold mb-2">{error}</p>
                <button onClick={fetchDepartments} className="text-xs font-bold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-xl px-4 py-2">Try Again</button>
              </div>
            ) : filteredDepts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <Building2 className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No departments found. Create one first.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Child Count</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDepts.map((dept) => (
                      <tr
                        key={dept.id}
                        onClick={() => setSelectedDepartment(dept)}
                        className="hover:bg-blue-50/20 cursor-pointer transition duration-150 group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-blue-800">{dept.code}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{dept.name}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-800 transition">
                            {dept._count?.programs ?? 0} programs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">Active</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={(e) => handleOpenEditDeptModal(e, dept)}
                            className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-100 text-slate-500 transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeactivateDept(e, dept)}
                            className="p-1.5 rounded-lg border border-red-50 bg-white hover:bg-red-50 text-red-500 transition inline-flex"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center pl-2 group-hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                            <span className="text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity mr-2 flex items-center animate-pulse">
                              👆 Click to view Programs
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-700 transition transform group-hover:translate-x-1" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── LEVEL 1: PROGRAMS LIST ─────────────────────────────────────────── */}
      {selectedDepartment && !selectedProgram && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDepartment(null)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Programs</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Showing programs inside the <strong className="text-slate-700">{selectedDepartment.name}</strong> department.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenAddProgModal}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Program</span>
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={programSearchQuery}
                onChange={(e) => setProgramSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={() => fetchPrograms(selectedDepartment.id)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {isLoadingPrograms ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
                <span className="text-sm text-slate-500 font-semibold">Loading programs...</span>
              </div>
            ) : programsError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <p className="text-red-600 font-semibold mb-2">{programsError}</p>
                <button onClick={() => fetchPrograms(selectedDepartment.id)} className="text-xs font-bold text-blue-700 rounded-xl px-4 py-2">Try Again</button>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No programs configured for this department yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Program Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Degree</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Semesters</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrograms.map((prog) => (
                      <tr
                        key={prog.id}
                        onClick={() => setSelectedProgram(prog)}
                        className="hover:bg-blue-50/20 cursor-pointer transition duration-150 group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-blue-800">{prog.code}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{prog.name}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">
                          {DEGREE_LABELS[prog.degreeType] ?? prog.degreeType}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                          {prog.totalSemesters} Semesters ({prog.duration} Yr)
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <button
                            onClick={(e) => handleToggleActiveProg(e, prog)}
                            className={`px-3 py-1 rounded-full font-bold transition text-[11px] ${
                              prog.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {prog.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={(e) => handleOpenEditProgModal(e, prog)}
                            className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-100 text-slate-500 transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleArchiveProg(e, prog)}
                            className="p-1.5 rounded-lg border border-red-50 bg-white hover:bg-red-50 text-red-500 transition inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center pl-2 group-hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                            <span className="text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity mr-2 flex items-center animate-pulse">
                              👆 Click to view Batches
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-700 transition transform group-hover:translate-x-1" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── LEVEL 2: BATCHES LIST ──────────────────────────────────────────── */}
      {selectedDepartment && selectedProgram && !selectedBatch && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Batches</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Manage student batches and linked syllabus regulations for <strong className="text-slate-700">{selectedProgram.name}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={handleOpenAddBatchModal}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/10 active:scale-[0.98] transition-all duration-150 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search batches by name or classroom..."
                value={batchSearchQuery}
                onChange={(e) => setBatchSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-200 transition duration-150 text-sm placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={() => fetchBatchesAndSchemes(selectedProgram.id)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            {isLoadingBatches ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
                <span className="text-sm text-slate-500 font-semibold">Loading batches...</span>
              </div>
            ) : batchesError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <p className="text-red-600 font-semibold mb-2">{batchesError}</p>
                <button onClick={() => fetchBatchesAndSchemes(selectedProgram.id)} className="text-xs font-bold text-blue-700 rounded-xl px-4 py-2">Try Again</button>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <Layers className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium text-sm">No batches registered. Add a batch for this program.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Class Room</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Years</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Scheme</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBatch(b)}
                        className="hover:bg-blue-50/20 cursor-pointer transition duration-150 group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{b.name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-800">
                          {b.classroom ? (
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                              {b.classroom}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-550">{b.startYear} – {b.endYear}</td>
                        <td className="px-6 py-4 text-sm font-bold text-violet-800">{b.scheme?.name ?? 'Unknown'}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider
                            ${b.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : ''}
                            ${b.status === 'UPCOMING' ? 'bg-blue-50 text-blue-750' : ''}
                            ${b.status === 'GRADUATED' ? 'bg-slate-100 text-slate-600' : ''}
                            ${b.status === 'ARCHIVED' ? 'bg-red-50 text-red-750' : ''}
                          `}>
                            {BATCH_STATUS_LABELS[b.status] ?? b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={(e) => handleOpenEditBatchModal(e, b)}
                            className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-100 text-slate-500 transition inline-flex"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleArchiveBatch(e, b)}
                            className="p-1.5 rounded-lg border border-red-50 bg-white hover:bg-red-50 text-red-500 transition inline-flex"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center pl-2 group-hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                            <span className="text-xs font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity mr-2 flex items-center animate-pulse">
                              👆 Click to view Calendar
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-700 transition transform group-hover:translate-x-1" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── LEVEL 3: SEMESTERS GRID ────────────────────────────────────────── */}
      {selectedDepartment && selectedProgram && selectedBatch && selectedSemester === null && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedBatch(null)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Academic Semesters</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Select a semester slot to configure its events and academic calendar for batch <strong className="text-slate-700">{selectedBatch.name}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: selectedProgram.totalSemesters }, (_, i) => {
              const semNo = i + 1;
              return (
                <div
                  key={semNo}
                  onClick={() => setSelectedSemester(semNo)}
                  className="bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition duration-200 rounded-3xl p-6 cursor-pointer flex flex-col justify-between h-[140px] group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm group-hover:bg-blue-900 group-hover:text-white transition-colors duration-250">
                      S{semNo}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-900 transition-transform transform group-hover:translate-x-0.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-widest">
                      SEMESTER
                    </span>
                    <span className="text-sm font-bold text-slate-800">Semester {semNo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── LEVEL 4: ACADEMIC CALENDAR VIEW ─────────────────────────────────── */}
      {selectedDepartment && selectedProgram && selectedBatch && selectedSemester !== null && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedSemester(null)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Semester {selectedSemester} Academic Calendar</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Cohort: <strong className="text-slate-700">{selectedBatch.name}</strong> {selectedBatch.classroom && `(${selectedBatch.classroom})`}. Configure academic calendar activities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Event Adder Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit">
              <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                Add Calendar Event
              </h3>

              <form onSubmit={handleAddEvent} className="space-y-4">
                {submitEventError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-medium">
                    {submitEventError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Event Title</label>
                  <input
                    type="text"
                    required
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="e.g. Midterm Examination"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Activity Date</label>
                  <input
                    type="date"
                    required
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-750"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Event Type</label>
                  <select
                    value={calType}
                    onChange={(e) => setCalType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                  >
                    <option value="EVENT">Event / General activity</option>
                    <option value="EXAM">Examination</option>
                    <option value="HOLIDAY">Holiday</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmittingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Event</span>
                </button>
              </form>
            </div>

            {/* Event List */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
                Calendar Entries
              </h3>

              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
                </div>
              ) : eventsError ? (
                <p className="text-sm text-red-655 font-semibold py-8 text-center">{eventsError}</p>
              ) : calendarEvents.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-semibold">No calendar events configured for S{selectedSemester}.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {calendarEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition duration-150"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full
                          ${evt.type === 'EXAM' ? 'bg-red-500' : ''}
                          ${evt.type === 'HOLIDAY' ? 'bg-amber-500' : ''}
                          ${evt.type === 'EVENT' ? 'bg-blue-500' : ''}
                        `} />
                        <div>
                          <p className="text-xs font-black text-slate-800">{evt.title}</p>
                          <div className="flex gap-2 text-[10px] text-slate-450 font-bold uppercase mt-1 tracking-wider">
                            <span>{evt.date}</span>
                            <span>•</span>
                            <span className={`
                              ${evt.type === 'EXAM' ? 'text-red-600' : ''}
                              ${evt.type === 'HOLIDAY' ? 'text-amber-600' : ''}
                              ${evt.type === 'EVENT' ? 'text-blue-600' : ''}
                            `}>{evt.type}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg border border-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Add/Edit Dept Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingDept ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-450 text-2xl hover:text-slate-700">&times;</button>
            </div>
            <form onSubmit={handleDeptSubmit} className="p-6 space-y-4">
              {submitDeptError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{submitDeptError}</p>}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Dept Name</label>
                <input type="text" required value={deptName} onChange={(e) => setDeptName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Dept Code</label>
                <input type="text" required value={deptCode} onChange={(e) => setDeptCode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold text-sm">Cancel</button>
                <button type="submit" disabled={isSubmittingDept} className="px-5 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold">{isSubmittingDept ? 'Saving...' : 'Save Department'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Program Modal */}
      {isProgModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingProg ? 'Edit Program' : 'Add Program'}</h3>
              <button onClick={() => setIsProgModalOpen(false)} className="text-slate-450 text-2xl hover:text-slate-700">&times;</button>
            </div>
            <form onSubmit={handleProgSubmit} className="p-6 space-y-4">
              {submitProgError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{submitProgError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Department</label>
                  <select
                    value={progDepartmentId}
                    onChange={(e) => setProgDepartmentId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold animate-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Program Name</label>
                  <input type="text" required value={progName} onChange={(e) => setProgName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-650 tracking-wider">Program Code</label>
                  <input type="text" required value={progCode} onChange={(e) => setProgCode(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-655 tracking-wider">Degree</label>
                  <select value={progDegreeType} onChange={(e) => setProgDegreeType(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">
                    <option value="BTECH">B.Tech</option>
                    <option value="MTECH">M.Tech</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-655 tracking-wider">Duration (Years)</label>
                  <select value={progDuration} onChange={(e) => setProgDuration(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={4}>4 Years</option>
                    <option value={5}>5 Years</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-655 tracking-wider">Total Semesters</label>
                  <input type="number" required min={1} max={10} value={progTotalSemesters} onChange={(e) => setProgTotalSemesters(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsProgModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold text-sm">Cancel</button>
                <button type="submit" disabled={isSubmittingProg} className="px-5 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold">{isSubmittingProg ? 'Saving...' : 'Save Program'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Batch Modal */}
      {isBatchModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingBatch ? 'Edit Cohort' : 'Add Cohort'}</h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-450 text-2xl hover:text-slate-700">&times;</button>
            </div>
            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
              {submitBatchError && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{submitBatchError}</p>}
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Cohort Batch Name</label>
                <input type="text" required value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. 2024–2028" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Class Room Name (Differentiator)</label>
                <input type="text" value={batchClassroom} onChange={(e) => setBatchClassroom(e.target.value)} placeholder="e.g. Room 204B, CSE Lab A" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">Start Year</label>
                  <input type="number" required value={batchStartYear} onChange={(e) => setBatchStartYear(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-600 tracking-wider">End Year</label>
                  <input type="number" required value={batchEndYear} onChange={(e) => setBatchEndYear(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-605 tracking-wider">Select Scheme</label>
                <select value={batchSchemeId} onChange={(e) => setBatchSchemeId(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">
                  {allSchemes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.university})</option>
                  ))}
                  {allSchemes.length === 0 && (
                    <option value="">⚠️ No Schemes created for this program. Create one in Schemes menu first.</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-605 tracking-wider">Cohort Status</label>
                <select value={batchStatus} onChange={(e) => setBatchStatus(e.target.value as any)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold">
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold text-sm">Cancel</button>
                <button type="submit" disabled={isSubmittingBatch || !batchSchemeId} className="px-5 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold">{isSubmittingBatch ? 'Saving...' : 'Save Cohort'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
