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

export interface Course {
  id: string;
  code: string; // e.g., CS8501
  name: string; // e.g., Theory of Computation
  departmentId: string;
  credits: number;
  semester: number;
  academicYear: string;
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
