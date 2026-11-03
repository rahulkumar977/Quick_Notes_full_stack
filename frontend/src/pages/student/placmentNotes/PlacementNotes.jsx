import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { ExploreNoteCard } from '../../../components/student/exploreNotes/ExploreNoteCard';
import {
  fetchExploreData,
  toggleBookmarkThunk,
  selectExploreLoading,
  selectEnrolledNoteIds,
  selectSavedNoteIds,
} from '../../../store/slices/exploreSlice';
import { noteApi } from '../../../services/noteApi';
import { academicApi } from '../../../services/academicApi';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  FileText,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

// Default standard placement tracks for quick navigation and curation
const DEFAULT_TRACK_SUGGESTIONS = [
  'Data Structures & Algorithms (DSA)',
  'Aptitude & Reasoning',
  'Web Development',
  'Core CS Subjects',
  'System Design',
  'Mock Interviews'
];

export const PlacementNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Current logged in user from auth slice
  const { user } = useSelector((state) => state.auth || {});
  const currentUserId = user?._id || user?.id;

  // Redux Selectors from explore slice
  const exploreLoading = useSelector(selectExploreLoading);
  const enrolledNoteIds = useSelector(selectEnrolledNoteIds);
  const savedNoteIds = useSelector(selectSavedNoteIds);
  const exploreNotes = useSelector((state) => state.explore.notes || []);

  // Local state
  const [myNotes, setMyNotes] = useState([]);
  const [placementCourse, setPlacementCourse] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Load placement courses, semesters (tracks), and personal notes
  const loadPlacementData = useCallback(async () => {
    try {
      const [coursesRes, myNotesRes] = await Promise.allSettled([
        academicApi.getAllCourses({ all: 'true' }),
        noteApi.getMyNotes({ all: 'true' })
      ]);

      let allCourses = [];
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.success) {
        allCourses = coursesRes.value.data || [];
      }

      if (myNotesRes.status === 'fulfilled' && myNotesRes.value?.success) {
        setMyNotes(myNotesRes.value.data || []);
      }

      // Find Placement Course in catalog
      const course = allCourses.find(
        (c) =>
          c &&
          (c.courseType === 'SKILL' ||
            /placement/i.test(c.name || '') ||
            /placement/i.test(c.slug || '') ||
            /placement/i.test(c.courseCode || ''))
      );

      if (course) {
        setPlacementCourse(course);
        // Fetch tracks (semesters) configured under Placement Preparation
        try {
          const semRes = await academicApi.getSemestersByCourse(course._id);
          if (semRes?.success && Array.isArray(semRes.data)) {
            setTracks(semRes.data);
          }
        } catch (semErr) {
          console.error('Error fetching placement tracks:', semErr);
        }
      }
    } catch (err) {
      console.error('Error loading placement notes data:', err);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Fetch explore notes & placement curriculum on mount
  useEffect(() => {
    dispatch(fetchExploreData());
    loadPlacementData();

    const handleAppRefresh = () => handleRefresh();
    window.addEventListener('app:refresh', handleAppRefresh);
    return () => window.removeEventListener('app:refresh', handleAppRefresh);
  }, [dispatch, loadPlacementData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([
        dispatch(fetchExploreData()).unwrap(),
        loadPlacementData()
      ]);
      toast.success('Placement notes refreshed');
    } catch {
      toast.error('Failed to refresh placement notes');
    } finally {
      setRefreshing(false);
    }
  };

  // Combine explore notes with user's personal notes (deduplicated by _id)
  const combinedNotes = useMemo(() => {
    const map = new Map();
    (exploreNotes || []).forEach((n) => {
      const id = n._id || n.id;
      if (id) map.set(String(id), n);
    });
    (myNotes || []).forEach((n) => {
      const id = n._id || n.id;
      if (id && !map.has(String(id))) {
        map.set(String(id), n);
      }
    });
    return Array.from(map.values());
  }, [exploreNotes, myNotes]);

  // Filter notes strictly related to Placement Preparation
  const placementNotes = useMemo(() => {
    return combinedNotes.filter((note) => {
      if (!note) return false;

      const courseName = typeof note.course === 'object' ? note.course?.name || '' : '';
      const courseSlug = typeof note.course === 'object' ? note.course?.slug || '' : '';
      const courseCode = typeof note.course === 'object' ? note.course?.courseCode || '' : '';
      const courseType = typeof note.course === 'object' ? note.course?.courseType || '' : '';

      // Direct match on course
      if (
        /placement/i.test(courseName) ||
        /placement/i.test(courseSlug) ||
        /placement/i.test(courseCode) ||
        courseType === 'SKILL'
      ) {
        return true;
      }

      // Semantic match on title, description, semester/track name, or subject
      const title = note.title || '';
      const desc = note.description || '';
      const subjName = typeof note.subject === 'object' ? note.subject?.name || '' : (note.subject || '');
      const semName = typeof note.semester === 'object' ? note.semester?.name || '' : '';

      const placementPattern = /\b(placement|interview|dsa|aptitude|system design|mock interview|resume|coding round|aptitude & reasoning)\b/i;
      return (
        placementPattern.test(title) ||
        placementPattern.test(desc) ||
        placementPattern.test(subjName) ||
        placementPattern.test(semName)
      );
    });
  }, [combinedNotes]);

  // Aggregate all unique tracks from both DB semesters and notes
  const allTracks = useMemo(() => {
    const trackMap = new Map();

    // 1. Tracks from database semesters under Placement Course
    (tracks || []).forEach((sem) => {
      if (sem && sem._id) {
        trackMap.set(String(sem._id), {
          id: String(sem._id),
          name: sem.name || `Track ${sem.semesterNumber || 1}`,
          semesterNumber: sem.semesterNumber || 1,
          isOfficial: true,
        });
      }
    });

    // 2. Tracks dynamically discovered from placement notes
    placementNotes.forEach((n) => {
      if (n.semester && typeof n.semester === 'object' && n.semester._id) {
        const id = String(n.semester._id);
        if (!trackMap.has(id)) {
          trackMap.set(id, {
            id,
            name: n.semester.name || `Track ${n.semester.semesterNumber || 1}`,
            semesterNumber: n.semester.semesterNumber || 1,
            isOfficial: true,
          });
        }
      }
    });

    // 3. If no official tracks exist yet in DB, include standard suggestions
    if (trackMap.size === 0) {
      DEFAULT_TRACK_SUGGESTIONS.forEach((sug, idx) => {
        const id = `sug-${idx + 1}`;
        trackMap.set(id, {
          id,
          name: sug,
          semesterNumber: idx + 1,
          isOfficial: false,
        });
      });
    }

    return Array.from(trackMap.values()).sort(
      (a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0)
    );
  }, [tracks, placementNotes]);

  // Helper to check if a note belongs to a specific track
  const noteMatchesTrack = useCallback((note, track) => {
    if (!note || !track) return false;

    // Match by semester ID
    if (note.semester) {
      const noteSemId = typeof note.semester === 'object' ? note.semester._id : note.semester;
      if (noteSemId && String(noteSemId) === String(track.id)) return true;

      // Match by semesterNumber
      const noteSemNum = typeof note.semester === 'object' ? note.semester.semesterNumber : Number(note.semester);
      if (noteSemNum && track.semesterNumber && noteSemNum === track.semesterNumber) {
        return true;
      }

      // Match by semester name
      const noteSemName = typeof note.semester === 'object' ? note.semester.name : '';
      if (noteSemName && track.name) {
        const nNorm = noteSemName.toLowerCase().replace(/[-_\s]+/g, '');
        const tNorm = track.name.toLowerCase().replace(/[-_\s]+/g, '');
        if (nNorm.includes(tNorm) || tNorm.includes(nNorm)) return true;
      }
    }

    // Match keywords against note subject or title
    const trackKeywords = track.name
      .toLowerCase()
      .replace(/[()]/g, '')
      .split(/[\s&/]+/)
      .filter((w) => w.length > 2);

    const targetText = `${note.title || ''} ${note.description || ''} ${
      typeof note.subject === 'object' ? note.subject?.name : note.subject || ''
    }`.toLowerCase();

    return trackKeywords.some((kw) => targetText.includes(kw));
  }, []);

  // Filter notes by selected track and search input
  const filteredNotes = useMemo(() => {
    let result = placementNotes;

    // 1. Track Filter
    if (selectedTrackId !== 'all') {
      const activeTrack = allTracks.find((t) => t.id === selectedTrackId);
      if (activeTrack) {
        result = result.filter((n) => noteMatchesTrack(n, activeTrack));
      }
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((n) => {
        const title = (n.title || '').toLowerCase();
        const desc = (n.description || '').toLowerCase();
        const subj = (typeof n.subject === 'object' ? n.subject?.name || '' : n.subject || '').toLowerCase();
        const sem = (typeof n.semester === 'object' ? n.semester?.name || '' : '').toLowerCase();
        const owner = (typeof n.owner === 'object' ? n.owner?.name || '' : '').toLowerCase();
        return (
          title.includes(q) ||
          desc.includes(q) ||
          subj.includes(q) ||
          sem.includes(q) ||
          owner.includes(q)
        );
      });
    }

    return result;
  }, [placementNotes, selectedTrackId, allTracks, searchQuery, noteMatchesTrack]);

  // Compute counts per track for badge counters
  const trackCounts = useMemo(() => {
    const counts = { all: placementNotes.length };
    allTracks.forEach((t) => {
      counts[t.id] = placementNotes.filter((n) => noteMatchesTrack(n, t)).length;
    });
    return counts;
  }, [placementNotes, allTracks, noteMatchesTrack]);

  // Check if current user is owner of a note
  const checkIsOwner = useCallback(
    (note) => {
      if (!note || !currentUserId) return false;
      const ownerId =
        typeof note.owner === 'object' && note.owner !== null
          ? note.owner._id || note.owner.id
          : note.owner;
      return ownerId ? String(currentUserId) === String(ownerId) : false;
    },
    [currentUserId]
  );

  // Check enrollment status (owners always have full access)
  const checkIsEnrolled = useCallback(
    (note) => {
      if (!note) return false;
      if (checkIsOwner(note)) return true;
      const noteId = String(note._id || note.id);
      return enrolledNoteIds.map(String).includes(noteId);
    },
    [checkIsOwner, enrolledNoteIds]
  );

  // Bookmark toggle handler with notifications
  const handleBookmarkToggle = useCallback(
    async (noteId) => {
      try {
        const result = await dispatch(toggleBookmarkThunk(noteId)).unwrap();
        toast.success(
          result.action === 'saved' ? 'Note saved to bookmarks' : 'Note removed from bookmarks'
        );
      } catch (err) {
        toast.error(err || 'Failed to update bookmark');
      }
    },
    [dispatch]
  );

  // Note card click handler (reusing existing preview and enrolled navigation flow)
  const handleSelectNote = (selected) => {
    const noteId = selected._id || selected.id;
    const isOwner = checkIsOwner(selected);
    const isEnrolled = checkIsEnrolled(selected);

    if (isOwner) {
      navigate('/student/explore/preview', {
        state: { note: selected, isOwner: true }
      });
    } else if (isEnrolled) {
      navigate('/student/enrolled-notes', {
        state: { note: selected, noteId }
      });
    } else {
      navigate('/student/explore/preview', { state: { note: selected } });
    }
  };

  const activeTrackObj = allTracks.find((t) => t.id === selectedTrackId);
  const isLoading = exploreLoading || localLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumbs */}
      <Breadcrumb items={[{ label: 'Placement Notes' }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Placement Preparation Notes</span>
                 
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Curated study notes, DSA sheets, aptitude modules, and interview preparation materials.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Refresh placement notes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const courseParam = placementCourse?.slug || placementCourse?.name || 'placement-preparation';
              navigate(`/student/add-notes?step=2&course=${encodeURIComponent(courseParam)}`);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Upload Note</span>
          </button>
        </div>
      </div>

      {/* ================= PLACEMENT TRACKS TAB BAR & SEARCH ================= */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 border border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Section Title */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Placement Tracks ({allTracks.length})
            </span>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in placement notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Scrollable Horizontal Track Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80">
          {/* "All Tracks" Tab */}
          <button
            type="button"
            onClick={() => setSelectedTrackId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
              selectedTrackId === 'all'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Tracks</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTrackId === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {trackCounts.all || 0}
            </span>
          </button>

          {/* Individual Track Tabs */}
          {allTracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            const count = trackCounts[track.id] || 0;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrackId(track.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{track.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= NOTES GRID ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {activeTrackObj ? activeTrackObj.name : 'All Placement Notes'} ({filteredNotes.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                • Matching "{searchQuery}"
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Click a card to open / preview</span>
        </div>

        {isLoading ? (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading placement preparation notes...
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3 rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {searchQuery
                  ? 'No placement notes matched your search'
                  : `No notes available in ${activeTrackObj ? activeTrackObj.name : 'Placement Preparation'}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords such as DSA, Aptitude, Java, System Design, or clear filters.'
                  : 'Be the first to share notes, cheat sheets, or interview experiences for this placement track!'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              ) : null}

               
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => {
              const noteId = note._id || note.id;
              const isOwner = checkIsOwner(note);
              const isEnrolled = checkIsEnrolled(note);
              const isSaved = savedNoteIds.map(String).includes(String(noteId));

              return (
                <ExploreNoteCard
                  key={noteId}
                  note={note}
                  isOwner={isOwner}
                  isEnrolled={isEnrolled}
                  isSaved={isSaved}
                  onBookmarkToggle={handleBookmarkToggle}
                  onSelectNote={handleSelectNote}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementNotes;

