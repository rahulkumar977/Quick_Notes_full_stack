import React from 'react';
import { FileText, Globe, Lock, Eye, Trash2, Loader2, Download, AlertCircle } from 'lucide-react';

export const AdminNotesTable = ({
  notes = [],
  loading = false,
  onOpenPdf,
  onToggleVisibility,
  onDeleteNote,
  updatingVisibilityId = null,
  deletingId = null
}) => {
  if (loading && notes.length === 0) {
    return (
      <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading repository notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Notes Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No repository notes matched your search query or filter selection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[20%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Note Details</th>
              <th className="py-3 px-4">Curriculum Hierarchy</th>
              <th className="py-3 px-4">Student Author</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4">Reads</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {notes.map((note) => {
              const id = note._id || note.id;
              const isUpdating = updatingVisibilityId === id;
              const isDeleting = deletingId === id;
              const isPublic = (note.visibility || 'PUBLIC').toUpperCase() === 'PUBLIC';

              const courseName = typeof note.course === 'object' ? note.course?.name || note.course?.courseCode || 'General' : note.course || 'General';
              const semNumber = typeof note.semester === 'object' ? note.semester?.semesterNumber || 1 : note.semester || 1;
              const subjectName = typeof note.subject === 'object' ? note.subject?.name || 'Subject' : note.subject || 'Subject';
              const authorName = typeof note.owner === 'object' ? note.owner?.name || 'Student' : note.owner || 'Student';
              const authorEmail = typeof note.owner === 'object' ? note.owner?.email || '' : '';

              return (
                <tr key={id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Title & Format */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)] dark:bg-slate-800 dark:text-slate-200 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate" title={note.title}>
                          {note.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {note.fileName || 'PDF Document'}
                          {note.pageCount ? ` • ${note.pageCount} pgs` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Hierarchy: Course, Sem, Subject */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {subjectName}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {courseName} • Sem {semNumber}
                    </p>
                  </td>

                  {/* Student Author */}
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {authorName}
                    </p>
                    {authorEmail && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {authorEmail}
                      </p>
                    )}
                  </td>

                  {/* Visibility Pill with Interactive Change */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onToggleVisibility && onToggleVisibility(note)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isPublic
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                      }`}
                      title="Click to toggle visibility"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin text-current" />
                      ) : isPublic ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span>{isPublic ? 'Public' : 'Private'}</span>
                      <span className="opacity-60 text-[9px] underline ml-0.5">Change</span>
                    </button>
                  </td>

                  {/* Views */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap">
                    {note.views ?? 0}
                  </td>

                  {/* Actions: Inspect & Delete */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {note.fileUrl ? (
                        <button
                          type="button"
                          onClick={() => onOpenPdf && onOpenPdf(note)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Inspect Note PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDeleteNote && onDeleteNote(id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Note"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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

export default AdminNotesTable;

