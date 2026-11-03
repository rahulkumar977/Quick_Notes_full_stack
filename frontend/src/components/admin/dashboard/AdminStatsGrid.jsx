import React from 'react';
import { Users, BookOpen, FileText, Eye, TrendingUp, CheckCircle2, Lock, Globe } from 'lucide-react';

export const AdminStatsGrid = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents ?? 0,
      subtext: `${stats.activeStudents ?? 0} active • ${stats.verifiedStudents ?? 0} verified`,
      icon: Users,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      badge: '+Active',
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Total Repository Notes',
      value: stats.totalNotes ?? 0,
      subtext: `${stats.publicNotes ?? 0} public • ${stats.privateNotes ?? 0} private`,
      icon: FileText,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      badge: 'Repository',
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses ?? 0,
      subtext: `${stats.totalSemesters ?? 0} configured semesters`,
      icon: BookOpen,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      badge: 'Academic',
      badgeColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
    },
    {
      title: 'Total Notes Views',
      value: (stats.totalViews ?? 0).toLocaleString(),
      subtext: `${stats.totalDownloads ?? 0} total downloads`,
      icon: Eye,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      badge: 'Engagement',
      badgeColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:border-[var(--primary)] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-3">
              {card.value}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{card.subtext}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsGrid;

