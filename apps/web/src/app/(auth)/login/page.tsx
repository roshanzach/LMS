'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';

// Define the 6 roles
type UserRole = 
  | 'SUPER_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'HOD'
  | 'FACULTY'
  | 'CLASS_ADVISOR'
  | 'STUDENT';

interface RoleConfig {
  id: UserRole;
  label: string;
  demoEmail: string;
}

const ROLES: RoleConfig[] = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', demoEmail: 'superadmin@unilms.edu.in' },
  { id: 'COLLEGE_ADMIN', label: 'College Admin', demoEmail: 'admin@unilms.edu.in' },
  { id: 'HOD', label: 'Head of Department', demoEmail: 'hod.cse@unilms.edu.in' },
  { id: 'FACULTY', label: 'Faculty', demoEmail: 'faculty.dbms@unilms.edu.in' },
  { id: 'CLASS_ADVISOR', label: 'Class Advisor', demoEmail: 'advisor.cse.a@unilms.edu.in' },
  { id: 'STUDENT', label: 'Student', demoEmail: 'student.22cse101@unilms.edu.in' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [isLoading, setIsLoading] = useState(false);

  // Automatically populate credentials when selecting a demo role
  const handleRoleSelect = (role: RoleConfig) => {
    setSelectedRole(role.id);
    setEmail(role.demoEmail);
    setPassword('demo1234'); // Demo password
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login redirect or API call
    setTimeout(() => {
      setIsLoading(false);
      const routeMap: Record<UserRole, string> = {
        SUPER_ADMIN: '/super-admin',
        COLLEGE_ADMIN: '/college-admin',
        HOD: '/hod',
        FACULTY: '/faculty',
        CLASS_ADVISOR: '/class-advisor',
        STUDENT: '/student',
      };
      router.push(routeMap[selectedRole]);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans p-6 md:p-8">
      {/* Spacer to push container to center vertically */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transition-transform hover:scale-105 duration-200">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              UniLMS
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              University Learning Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-150 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition duration-150"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-slate-600 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Demo Login Header */}
            <div className="text-center pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DEMO LOGIN - Select a role:
              </span>
            </div>

            {/* Role Selectors */}
            <div className="flex flex-col space-y-2.5">
              {ROLES.map((role) => {
                const isActive = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 hover:bg-blue-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <span className="text-sm text-slate-500">
                Forgot your password?{' '}
                <a href="#reset" className="text-blue-600 hover:underline font-medium">
                  Reset it
                </a>
              </span>
            </div>

          </form>
        </div>
      </div>

      {/* Wireframe Caption Footer */}
      <div className="text-center max-w-lg mx-auto mt-6">
        <p className="text-xs leading-relaxed text-slate-400 font-medium">
          This is a wireframe prototype showcasing the University LMS design.
          <br />
          Click any role above to explore that role&apos;s interface.
        </p>
      </div>
    </div>
  );
}
