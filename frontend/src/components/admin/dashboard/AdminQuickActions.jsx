import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, ArrowRight, Shield, Layers } from 'lucide-react';

export const AdminQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Student Records',
      description: 'Inspect registered student profiles, verify accounts, and manage active/suspended states.',
      icon: Users,
      path: '/admin/users',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60'
    },
    {
      title: 'Repository Notes',
      description: 'Audit uploaded notes, inspect contents via PDF viewer, and toggle public or private visibility.',
      icon: FileText,
      path: '/admin/notes',
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Quick Management Portals
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(act.path)}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] transition-all cursor-pointer group shadow-xs flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl border shrink-0 ${act.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[var(--primary)] transition-colors">
                    {act.title}
                  </h4>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminQuickActions;

