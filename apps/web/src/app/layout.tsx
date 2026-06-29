import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UniLMS - University Learning Management System',
  description: 'Outcome-Based Education Learning Management System for Indian Engineering Colleges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
