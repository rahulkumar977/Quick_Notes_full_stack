import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Mail, Calendar, Power, Loader2, User } from 'lucide-react';

export const StudentTable = ({
  students = [],
  loading = false,
  onToggleStatus,
  updatingId = null
}) => {
  if (loading && students.length === 0) {
    return (
      <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading student records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Student Records Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No students matched your search criteria or no accounts have registered yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs table-fixed">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[26%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Student Details</th>
              <th className="py-3 px-4">Academic Profile</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {students.map((st) => {
              const id = st._id || st.id;
              const isUpdating = updatingId === id;
              const isActive = st.isActive !== false;
              const course = st.academicProfile?.courseName || 'Unassigned';
              const semester = st.academicProfile?.currentSemester || 1;
              const joinedDate = st.createdAt
                ? new Date(st.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : '—';

              return (
                <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Name and Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] dark:bg-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {st.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{st.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{st.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Academic Profile */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{course}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Semester {semester}</p>
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {st.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <XCircle className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{isActive ? 'Active' : 'Suspended'}</span>
                    </span>
                  </td>

                  {/* Actions: Toggle Active/Suspended */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onToggleStatus && onToggleStatus(st)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        isActive
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className="w-3 h-3" />
                      )}
                      <span>{isActive ? 'Suspend' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;

