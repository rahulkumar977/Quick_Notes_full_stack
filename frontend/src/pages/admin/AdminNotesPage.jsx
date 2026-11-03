import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { PdfView } from '../../components/common/PdfView';
import { AdminNotesStats } from '../../components/admin/notes/AdminNotesStats';
import { AdminNotesFilterBar } from '../../components/admin/notes/AdminNotesFilterBar';
import { AdminNotesTable } from '../../components/admin/notes/AdminNotesTable';
import { adminApi } from '../../services/adminApi';
import { RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Interactive PDF Inspection state (reuses common PdfView component)
  const [selectedPdfNote, setSelectedPdfNote] = useState(null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await adminApi.getAllNotes();
      if (res?.success && Array.isArray(res.data)) {
        setNotes(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin notes:', err);
      toast.error('Failed to load notes repository');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotes();
      toast.success('Notes repository refreshed');
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle Visibility (Public <-> Private)
  const handleToggleVisibility = async (note) => {
    const id = note._id || note.id;
    const currentVis = (note.visibility || 'PUBLIC').toUpperCase();
    const nextVis = currentVis === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    setUpdatingVisibilityId(id);

    try {
      const res = await adminApi.updateNoteVisibility(id, nextVis);
      if (res?.success) {
        setNotes((prev) =>
          prev.map((n) => ((n._id || n.id) === id ? { ...n, visibility: nextVis } : n))
        );
        toast.success(`Note marked as ${nextVis}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update visibility');
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study note from the repository?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminApi.deleteNote(id);
      if (res?.success) {
        setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
        toast.success('Note deleted successfully');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    let list = notes;

    if (visibilityFilter !== 'all') {
      list = list.filter(
        (n) => (n.visibility || 'PUBLIC').toUpperCase() === visibilityFilter.toUpperCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((n) => {
        const title = (n.title || '').toLowerCase();
        const subj = (typeof n.subject === 'object' ? n.subject?.name || '' : n.subject || '').toLowerCase();
        const author = (typeof n.owner === 'object' ? n.owner?.name || '' : n.owner || '').toLowerCase();
        const course = (typeof n.course === 'object' ? n.course?.name || '' : n.course || '').toLowerCase();
        return title.includes(q) || subj.includes(q) || author.includes(q) || course.includes(q);
      });
    }

    return list;
  }, [notes, visibilityFilter, searchQuery]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = notes.length;
    const publicCount = notes.filter((n) => (n.visibility || 'PUBLIC').toUpperCase() === 'PUBLIC').length;
    const privateCount = notes.filter((n) => (n.visibility || 'PUBLIC').toUpperCase() === 'PRIVATE').length;
    const views = notes.reduce((acc, n) => acc + (n.views || 0), 0);
    return { total, publicCount, privateCount, views };
  }, [notes]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setVisibilityFilter('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', onClick: () => window.location.assign('/admin/dashboard') },
          { label: 'Notes Repository' }
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            <span>Repository Notes Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor, inspect, and manage university study notes uploaded by students across all curricula.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
          <span>Refresh Notes</span>
        </button>
      </div>

      {/* 1. Notes Stats Header Component */}
      <AdminNotesStats
        total={stats.total}
        publicCount={stats.publicCount}
        privateCount={stats.privateCount}
        views={stats.views}
      />

      {/* 2. Filter Bar Component */}
      <AdminNotesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={setVisibilityFilter}
        totalCount={filteredNotes.length}
        onReset={handleResetFilters}
      />

      {/* 3. Notes Table Component */}
      <AdminNotesTable
        notes={filteredNotes}
        loading={loading}
        onOpenPdf={(note) => setSelectedPdfNote(note)}
        onToggleVisibility={handleToggleVisibility}
        onDeleteNote={handleDeleteNote}
        updatingVisibilityId={updatingVisibilityId}
        deletingId={deletingId}
      />

      {/* Reused Common PDF Viewer Modal */}
      {selectedPdfNote && (
        <PdfView
          note={selectedPdfNote}
          isOpen={Boolean(selectedPdfNote)}
          onClose={() => setSelectedPdfNote(null)}
          isLocked={false}
        />
      )}
    </div>
  );
};

export default AdminNotesPage;
