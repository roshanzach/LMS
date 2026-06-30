'use client';

import React from 'react';

interface PlaceholderViewProps {
  title: string;
}

export default function PlaceholderView({ title }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] select-none">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
          />
        </svg>
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-slate-300 text-xs mt-1">Nothing There.</p>
    </div>
  );
}
