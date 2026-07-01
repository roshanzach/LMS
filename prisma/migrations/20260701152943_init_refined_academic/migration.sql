-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD', 'FACULTY', 'CLASS_ADVISOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('BTECH', 'MTECH', 'MCA');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('CORE', 'PROFESSIONAL_ELECTIVE', 'OPEN_ELECTIVE', 'LAB', 'MINI_PROJECT', 'MAJOR_PROJECT', 'SEMINAR', 'INTERNSHIP', 'MINOR', 'HONORS');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'GRADUATED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "colleges" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "college_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "college_id" UUID,
    "department_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "enrollment_no" TEXT NOT NULL,
    "current_semester" INTEGER NOT NULL,
    "college_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,

    CONSTRAINT "faculty_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "ltp" TEXT,
    "category" "CourseCategory" NOT NULL DEFAULT 'CORE',
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "semester_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "degree_type" "DegreeType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_semesters" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "department_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "university" TEXT NOT NULL DEFAULT 'KTU',
    "effective_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "program_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "program_id" UUID NOT NULL,
    "scheme_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" UUID NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "scheme_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_code_key" ON "colleges"("code");

-- CreateIndex
CREATE INDEX "departments_college_id_idx" ON "departments"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_college_id_code_key" ON "departments"("college_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "student_profiles_batch_id_idx" ON "student_profiles"("batch_id");

-- CreateIndex
CREATE INDEX "student_profiles_user_id_idx" ON "student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "student_profiles_college_id_idx" ON "student_profiles"("college_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_college_id_enrollment_no_key" ON "student_profiles"("college_id", "enrollment_no");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_profiles_user_id_key" ON "faculty_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_profiles_employee_id_key" ON "faculty_profiles"("employee_id");

-- CreateIndex
CREATE INDEX "courses_semester_id_idx" ON "courses"("semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_semester_id_code_key" ON "courses"("semester_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_student_id_course_id_key" ON "course_enrollments"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "programs_department_id_idx" ON "programs"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "programs_department_id_code_key" ON "programs"("department_id", "code");

-- CreateIndex
CREATE INDEX "schemes_program_id_idx" ON "schemes"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_program_id_name_key" ON "schemes"("program_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_id_program_id_key" ON "schemes"("id", "program_id");

-- CreateIndex
CREATE INDEX "batches_program_id_idx" ON "batches"("program_id");

-- CreateIndex
CREATE INDEX "batches_scheme_id_idx" ON "batches"("scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "batches_program_id_start_year_key" ON "batches"("program_id", "start_year");

-- CreateIndex
CREATE INDEX "semesters_scheme_id_idx" ON "semesters"("scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_scheme_id_semester_number_key" ON "semesters"("scheme_id", "semester_number");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schemes" ADD CONSTRAINT "schemes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_scheme_id_program_id_fkey" FOREIGN KEY ("scheme_id", "program_id") REFERENCES "schemes"("id", "program_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
