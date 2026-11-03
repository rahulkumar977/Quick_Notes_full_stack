import React from 'react';
import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';

export const StudentStatsHeader = ({ total = 0, active = 0, suspended = 0, verified = 0 }) => {
  const items = [
    { label: 'Total Registered', count: total, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
    { label: 'Active Students', count: active, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: 'Suspended Accounts', count: suspended, icon: UserX, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' },
    { label: 'Verified Emails', count: verified, icon: ShieldCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' }
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

export default StudentStatsHeader;

