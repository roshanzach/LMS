'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Layers,
  BookOpen,
  Edit2,
  Loader2,
  RefreshCw,
  X,
  Eye,
  ChevronLeft,
  Trash2,
  Power,
} from 'lucide-react';

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
  deletedAt?: string | null;
  program?: Program;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  ltp?: string | null;
  category: string;
  description?: string | null;
}

interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
  courses?: Course[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const COURSE_CATEGORIES = [
  { value: 'CORE', label: 'Core Subject' },
  { value: 'PROFESSIONAL_ELECTIVE', label: 'Professional Elective' },
  { value: 'OPEN_ELECTIVE', label: 'Open Elective' },
  { value: 'LAB', label: 'Laboratory' },
  { value: 'MINI_PROJECT', label: 'Mini Project' },
  { value: 'MAJOR_PROJECT', label: 'Major Project' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'MINOR', label: 'Minor Course' },
  { value: 'HONORS', label: 'Honors Course' },
];

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
  const [selectedSemesterForCourses, setSelectedSemesterForCourses] = useState<Semester | null>(null);

  // Semester list states
  const [semesterList, setSemesterList] = useState<Semester[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  // Scheme form states
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('KTU');
  const [effectiveYear, setEffectiveYear] = useState<number>(new Date().getFullYear());
  const [programId, setProgramId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Course form states
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState(4);
  const [courseLtp, setCourseLtp] = useState('3-0-0');
  const [courseCategory, setCourseCategory] = useState('CORE');
  const [courseDescription, setCourseDescription] = useState('');
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [courseSubmitError, setCourseSubmitError] = useState<string | null>(null);

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

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [schemesRes, progRes] = await Promise.all([
        fetch(`${API_BASE}/college-admin/schemes`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/college-admin/programs`, { headers: getAuthHeaders() }),
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

  const fetchSemestersOfScheme = async (schemeId: string) => {
    setIsLoadingSemesters(true);
    try {
      const res = await fetch(`${API_BASE}/college-admin/schemes/${schemeId}/semesters`, {
        headers: getAuthHeaders()
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

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch semesters when viewing scheme details
  useEffect(() => {
    if (selectedSchemeForSemesters) {
      fetchSemestersOfScheme(selectedSchemeForSemesters.id);
      setSelectedSemesterForCourses(null); // Reset nested courses panel
    }
  }, [selectedSchemeForSemesters]);

  // Find currently selected semester item dynamically to keep courses in sync
  const currentSemesterItem = semesterList.find(
    (s) => s.id === selectedSemesterForCourses?.id
  );

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
          ...getAuthHeaders()
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

  const handleToggleSchemeStatus = async (sch: Scheme) => {
    try {
      if (sch.deletedAt) {
        // Reactivate
        const res = await fetch(`${API_BASE}/college-admin/schemes/${sch.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ deletedAt: null }),
        });
        if (!res.ok) throw new Error('Failed to reactivate scheme');
      } else {
        // Deactivate (soft delete)
        const res = await fetch(`${API_BASE}/college-admin/schemes/${sch.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to deactivate scheme');
      }
      fetchData();
    } catch (err: any) {
      alert(err.message ?? 'Failed to update status');
    }
  };

  // Course CRUD handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseSubmitError(null);
    if (!selectedSemesterForCourses || !selectedSchemeForSemesters) return;
    if (!courseName.trim() || !courseCode.trim()) {
      setCourseSubmitError('Name and Code are required.');
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const res = await fetch(`${API_BASE}/college-admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name: courseName.trim(),
          code: courseCode.trim().toUpperCase(),
          credits: Number(courseCredits),
          ltp: courseLtp.trim() || null,
          category: courseCategory,
          description: courseDescription.trim() || null,
          semesterId: selectedSemesterForCourses.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message ?? 'Failed to add subject');
      }

      setCourseName('');
      setCourseCode('');
      setCourseCredits(4);
      setCourseLtp('3-0-0');
      setCourseCategory('CORE');
      setCourseDescription('');

      await fetchSemestersOfScheme(selectedSchemeForSemesters.id);
    } catch (err: any) {
      setCourseSubmitError(err.message ?? 'Failed to add subject.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!selectedSchemeForSemesters) return;
    if (!confirm('Are you sure you want to delete this course from the scheme semester?')) return;
    try {
      const res = await fetch(`${API_BASE}/college-admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete course');
      await fetchSemestersOfScheme(selectedSchemeForSemesters.id);
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete course');
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
            Configure academic regulation standards, manage semesters, and add courses.
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
                      {sch.deletedAt ? (
                        <span className="px-3 py-1 rounded-full font-bold bg-rose-50 text-rose-700">Deactivated</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <button
                        onClick={() => setSelectedSchemeForSemesters(sch)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-950 transition inline-flex items-center justify-center gap-1 text-xs font-bold"
                        title="View Semesters"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage Courses</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sch)}
                        className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition inline-flex items-center justify-center"
                        title="Edit scheme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleSchemeStatus(sch)}
                        title={sch.deletedAt ? "Reactivate" : "Deactivate"}
                        className={`p-1.5 rounded-lg border transition inline-flex ${
                          sch.deletedAt 
                            ? "border-emerald-50 bg-white hover:bg-emerald-50 text-emerald-600" 
                            : "border-red-50 bg-white hover:bg-red-50 text-red-500"
                        }`}
                      >
                        {sch.deletedAt ? <RefreshCw className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-105"
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
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-650 hover:bg-slate-100 transition"
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

      {/* Semester Structure & Course Mapper Modal */}
      {selectedSchemeForSemesters && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSchemeForSemesters(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedSemesterForCourses 
                    ? `S${selectedSemesterForCourses.semesterNumber} Subjects Configuration` 
                    : 'Semester Structure Mapping'}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  Scheme: <strong className="text-slate-600">{selectedSchemeForSemesters.name}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedSchemeForSemesters(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingSemesters ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
                </div>
              ) : semesterList.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm">No semesters generated under this scheme.</p>
              ) : selectedSemesterForCourses === null ? (
                
                /* LIST OF SEMESTERS GRID */
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Click on any semester card below to view, add, or delete its mapped subjects/courses.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {semesterList.map((sem) => (
                      <div
                        key={sem.id}
                        onClick={() => setSelectedSemesterForCourses(sem)}
                        className="bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition duration-150 rounded-2xl p-4 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm group-hover:bg-blue-900 group-hover:text-white transition">
                            S{sem.semesterNumber}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800">{sem.name}</span>
                            <span className="text-[10px] text-slate-400 block font-bold mt-0.5">
                              {sem.courses?.length ?? 0} subjects configured
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-slate-350 group-hover:text-blue-900 transition" />
                      </div>
                    ))}
                  </div>
                </div>

              ) : (

                /* COURSE MANAGEMENT WORKSPACE FOR SELECTED SEMESTER */
                <div className="space-y-6">
                  
                  {/* Back Link */}
                  <button
                    onClick={() => setSelectedSemesterForCourses(null)}
                    className="flex items-center gap-1.5 text-xs font-black text-blue-800 hover:text-blue-900 transition uppercase tracking-wider mb-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Semesters</span>
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Add Course Form (Left) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 h-fit space-y-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                        Add New Subject
                      </h4>

                      <form onSubmit={handleCreateCourse} className="space-y-3.5">
                        {courseSubmitError && (
                          <div className="bg-red-50 border border-red-100 text-red-650 rounded-lg p-3 text-xs font-medium">
                            {courseSubmitError}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subject Name</label>
                          <input
                            type="text"
                            required
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="e.g. Compiler Design"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subject Code</label>
                          <input
                            type="text"
                            required
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="e.g. CST 302"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Credits</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={10}
                              value={courseCredits}
                              onChange={(e) => setCourseCredits(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">L-T-P</label>
                            <input
                              type="text"
                              value={courseLtp}
                              onChange={(e) => setCourseLtp(e.target.value)}
                              placeholder="3-0-0"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Category</label>
                          <select
                            value={courseCategory}
                            onChange={(e) => setCourseCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                          >
                            {COURSE_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Description (Optional)</label>
                          <textarea
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            rows={2}
                            placeholder="Brief course objectives..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingCourse}
                          className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                          {isSubmittingCourse ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>Add Subject</span>
                        </button>
                      </form>
                    </div>

                    {/* Courses Mapped List (Right) */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2">
                        Configured Subjects in S{selectedSemesterForCourses.semesterNumber}
                      </h4>

                      {!currentSemesterItem?.courses || currentSemesterItem.courses.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                          <BookOpen className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-400">No subjects configured in this semester.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {currentSemesterItem.courses.map((c) => (
                            <div
                              key={c.id}
                              className="bg-white border border-slate-100 hover:border-slate-200 rounded-xl p-4 flex items-start justify-between shadow-sm transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-50 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                                    {c.code}
                                  </span>
                                  <h5 className="text-sm font-bold text-slate-850">{c.name}</h5>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-0.5">
                                  <span>Credits: {c.credits}</span>
                                  {c.ltp && (
                                    <>
                                      <span>•</span>
                                      <span>L-T-P: {c.ltp}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="text-violet-650 bg-violet-50 px-1.5 py-0.5 rounded-md text-[9px]">
                                    {c.category}
                                  </span>
                                </div>
                                {c.description && (
                                  <p className="text-xs text-slate-500 font-medium pt-1 line-clamp-1">
                                    {c.description}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteCourse(c.id)}
                                className="p-1.5 rounded-lg border border-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 transition self-center"
                                title="Delete course"
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
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
