import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, ArrowRight, Globe, Lock, Clock, CheckCircle2 } from 'lucide-react';

export const AdminRecentActivity = ({ recentStudents = [], recentNotes = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Recent Registered Students */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recent Students ({recentStudents.length})
            </h3>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentStudents.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic">
            No student registrations recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentStudents.map((st) => (
              <div key={st._id || st.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {st.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {st.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {st.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    {st.academicProfile?.courseName || 'General Student'}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    st.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}>
                    {st.isActive !== false ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Recent Uploaded Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recent Notes ({recentNotes.length})
            </h3>
          </div>
          <button
            onClick={() => navigate('/admin/notes')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic">
            No notes uploaded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentNotes.map((note) => {
              const isPublic = (note.visibility || 'PUBLIC').toUpperCase() === 'PUBLIC';
              const courseTitle = note.course?.name || note.course?.courseCode || 'Course';
              const semNum = note.semester?.semesterNumber || 1;

              return (
                <div key={note._id || note.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {note.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        By {note.owner?.name || 'Student'} • {courseTitle} (Sem {semNum})
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      isPublic
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      <span>{isPublic ? 'Public' : 'Private'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRecentActivity;

