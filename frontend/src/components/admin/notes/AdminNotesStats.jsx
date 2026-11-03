import React from 'react';
import { FileText, Globe, Lock, Eye } from 'lucide-react';

export const AdminNotesStats = ({ total = 0, publicCount = 0, privateCount = 0, views = 0 }) => {
  const items = [
    { label: 'Total Notes', count: total, icon: FileText, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
    { label: 'Public Notes', count: publicCount, icon: Globe, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: 'Private Notes', count: privateCount, icon: Lock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
    { label: 'Total Reads / Views', count: views.toLocaleString(), icon: Eye, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-xs"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {it.label}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {it.count}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${it.color}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminNotesStats;

