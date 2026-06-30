import React from 'react';

interface PlaceholderViewProps {
  title: string;
}

export default function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="p-6 md:p-8">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">
          This section is currently non-functional in this wireframe prototype.
        </p>
      </div>
    </div>
  );
}
