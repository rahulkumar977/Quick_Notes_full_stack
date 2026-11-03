import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const AdminNotesFilterBar = ({
  searchQuery,
  onSearchChange,
  visibilityFilter,
  onVisibilityChange,
  totalCount = 0,
  onReset
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, subject, student author..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
        />
      </div>

      {/* Filter by Visibility & Counter */}
      <div className="flex items-center gap-2 justify-between sm:justify-end">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={visibilityFilter}
            onChange={(e) => onVisibilityChange(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Visibility</option>
            <option value="PUBLIC">Public Notes</option>
            <option value="PRIVATE">Private Notes</option>
          </select>
        </div>

        {(searchQuery || visibilityFilter !== 'all') && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800">
          {totalCount} {totalCount === 1 ? 'Note' : 'Notes'}
        </span>
      </div>
    </div>
  );
};

export default AdminNotesFilterBar;

