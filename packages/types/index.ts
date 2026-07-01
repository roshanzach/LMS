export type UserRole = 
  | 'SUPER_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'HOD'
  | 'FACULTY'
  | 'CLASS_ADVISOR'
  | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DegreeType = 'BTECH' | 'MTECH' | 'MCA';

export type CourseCategory =
  | 'CORE'
  | 'PROFESSIONAL_ELECTIVE'
  | 'OPEN_ELECTIVE'
  | 'LAB'
  | 'MINI_PROJECT'
  | 'MAJOR_PROJECT'
  | 'SEMINAR'
  | 'INTERNSHIP'
  | 'MINOR'
  | 'HONORS';

export interface Course {
  id: string;
  code: string; // e.g., CS8501
  name: string; // e.g., Theory of Computation
  credits: number;
  ltp?: string;
  category?: CourseCategory;
  description?: string;
  semesterId: string;
  isActive: boolean;
}

export interface CourseOutcome {
  id: string;
  courseId: string;
  code: string; // e.g., CO1, CO2
  description: string;
  targetPercentage: number; // e.g., 70% attainment target
}

export interface ProgramOutcome {
  id: string;
  code: string; // e.g., PO1, PO2, PSO1
  name: string;
  description: string;
}

export interface COPOMapping {
  id: string;
  courseOutcomeId: string;
  programOutcomeId: string;
  mappingStrength: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High mapping correlation
}

export interface Program {
  id: string;
  name: string;
  code: string;
  degreeType: DegreeType;
  duration: number;
  totalSemesters: number;
  isActive: boolean;
  departmentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Scheme {
  id: string;
  name: string;
  university: string;
  effectiveYear: number;
  isActive: boolean;
  programId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  isActive: boolean;
  programId: string;
  schemeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
  schemeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  enrollmentNo: string;
  currentSemester: number;
  batchId: string;
}
