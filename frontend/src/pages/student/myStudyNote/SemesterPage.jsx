import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { PdfView } from '../../../components/common/PdfView';
import {
  fetchMyCourses,
  fetchAllCourses,
  fetchSemestersByCourse,
  fetchSubjectsBySemester,
  setSelectedCourse,
} from '../../../store/slices/courseSlice';
import { noteApi } from '../../../services/noteApi';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Eye,
  Plus,
  Loader2,
  ArrowLeft,
  FileText,
  Download,
  Globe,
  Lock,
  RefreshCw,
  Edit3
} from 'lucide-react';

export const SemesterPage = () => {
  const { semesterId: pathSemesterId, subjectId: pathSubjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Support query params (?course=btech&semester=1&subject=math) as well as route params (:semesterId, :subjectId)
  const courseParam = searchParams.get('course');
  const semesterParam = searchParams.get('semester') || pathSemesterId;
  const subjectParam = searchParams.get('subject') || pathSubjectId;

  // Read academic state from courseSlice
  const {
    myCourses,
    allCourses,
    selectedCourse,
    semesters,
    semestersByCourse,
    subjectsBySemester,
    loading: courseLoading
  } = useSelector((state) => state.course);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [selectedPdfNote, setSelectedPdfNote] = useState(location.state?.note || null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState(null);

  // Auto-open PDF modal if navigated from Dashboard or another page with note in location.state
  useEffect(() => {
    if (location.state?.note) {
      setSelectedPdfNote(location.state.note);
    } else if (location.state?.noteId && notes.length > 0) {
      const found = notes.find((n) => (n._id || n.id) === location.state.noteId);
      if (found) setSelectedPdfNote(found);
    }
  }, [location.state, notes]);

  // 1. Ensure courses are loaded in Redux
  useEffect(() => {
    if (!myCourses || myCourses.length === 0) {
      dispatch(fetchMyCourses());
    }
    if (!allCourses || allCourses.length === 0) {
      dispatch(fetchAllCourses());
    }
  }, [dispatch, myCourses?.length, allCourses?.length]);

  // Combined available courses
  const availableCourses = useMemo(() => {
    const myMap = new Map((myCourses || []).map((c) => [c._id, c]));
    const list = [...(myCourses || [])];
    (allCourses || []).forEach((c) => {
      if (c && c._id && !myMap.has(c._id) && c.isActive !== false) {
        list.push(c);
      }
    });
    return list;
  }, [myCourses, allCourses]);

  // 2. Ensure an active course is selected or matched from courseParam
  useEffect(() => {
    if (availableCourses.length > 0) {
      if (courseParam) {
        const cleanCourse = decodeURIComponent(String(courseParam)).trim().toLowerCase();
        const cleanCourseNorm = cleanCourse.replace(/[-_\s]+/g, '');
        const matched = availableCourses.find(
          (c) =>
            c._id === courseParam ||
            (c.slug && (c.slug.toLowerCase() === cleanCourse || c.slug.toLowerCase().replace(/[-_\s]+/g, '') === cleanCourseNorm)) ||
            (c.name && (c.name.toLowerCase() === cleanCourse || c.name.toLowerCase().replace(/[-_\s]+/g, '') === cleanCourseNorm))
        );
        if (matched && (!selectedCourse || selectedCourse._id !== matched._id)) {
          dispatch(setSelectedCourse(matched));
          return;
        }
      }
      if (!selectedCourse) {
        dispatch(setSelectedCourse(availableCourses[0]));
      }
    }
  }, [availableCourses, courseParam, selectedCourse, dispatch]);

  // 3. Ensure semesters for the selected course are loaded (cached check)
  useEffect(() => {
    if (selectedCourse?._id && (!semesters || semesters.length === 0)) {
      if (!semestersByCourse?.[selectedCourse._id]) {
        dispatch(fetchSemestersByCourse(selectedCourse._id));
      }
    }
  }, [selectedCourse?._id, semesters?.length, semestersByCourse, dispatch]);

  // 4. Resolve current semester from Redux semesters list (supports semesterNumber, _id, or name)
  const currentSemester = useMemo(() => {
    if (!semesters || semesters.length === 0 || !semesterParam) return null;
    const cleanParam = decodeURIComponent(String(semesterParam)).trim().toLowerCase();
    const cleanParamNorm = cleanParam.replace(/[-_\s]+/g, '');
    return (
      semesters.find((s) => String(s.semesterNumber) === cleanParam) ||
      semesters.find((s) => s._id === semesterParam) ||
      semesters.find((s) => s.name?.toLowerCase() === cleanParam) ||
      semesters.find((s) => s.name?.toLowerCase().replace(/[-_\s]+/g, '') === cleanParamNorm) ||
      null
    );
  }, [semesters, semesterParam]);

  // Guard against non-ObjectId values (e.g. "1") when calling backend APIs
  const resolvedSemesterId =
    currentSemester?._id ||
    (/^[0-9a-fA-F]{24}$/.test(semesterParam) ? semesterParam : null);

  // 5. Read subjects for this semester from Redux cache
  const subjects = useMemo(() => {
    if (!resolvedSemesterId) return [];
    return subjectsBySemester[resolvedSemesterId] || [];
  }, [subjectsBySemester, resolvedSemesterId]);

  // 6. Fetch subjects via courseSlice if not yet cached in Redux
  useEffect(() => {
    if (resolvedSemesterId && !subjectsBySemester[resolvedSemesterId]) {
      dispatch(fetchSubjectsBySemester(resolvedSemesterId));
    }
  }, [resolvedSemesterId, subjectsBySemester, dispatch]);

  // Specific subject resolution when subjectParam is in URL (supports name, subjectCode, slug, or _id)
  const currentSubject = useMemo(() => {
    if (!subjectParam || !subjects || subjects.length === 0) return null;
    const cleanParam = decodeURIComponent(String(subjectParam)).trim().toLowerCase();
    return (
      subjects.find((s) => s.name?.toLowerCase() === cleanParam) ||
      subjects.find((s) => s.subjectCode?.toLowerCase() === cleanParam) ||
      subjects.find((s) => s.slug?.toLowerCase() === cleanParam) ||
      subjects.find((s) => s._id === subjectParam) ||
      null
    );
  }, [subjects, subjectParam]);

  const resolvedSubjectId =
    currentSubject?._id ||
    (/^[0-9a-fA-F]{24}$/.test(subjectParam) ? subjectParam : null);

  // Filter display list: if subjectParam is provided, show only that specific subject
  const displaySubjects = useMemo(() => {
    if (!subjectParam) return subjects;
    if (currentSubject) return [currentSubject];
    return [];
  }, [subjects, subjectParam, currentSubject]);

  // 7. Fetch notes: when subjectParam is present, fetch specifically for that subject
  useEffect(() => {
    let isMounted = true;
    const fetchNotes = async () => {
      if (!resolvedSemesterId) return;
      // If a subject is specified in URL, wait until it resolves to avoid loading all notes first
      if (subjectParam && !resolvedSubjectId) return;

      setNotesLoading(true);
      try {
        const queryParams = {
          semester: resolvedSemesterId,
          all: 'true'
        };
        if (resolvedSubjectId) {
          queryParams.subject = resolvedSubjectId;
        }
        const res = await noteApi.getMyNotes(queryParams);
        if (isMounted) {
          setNotes(res?.data || []);
        }
      } catch (err) {
        console.error('Error loading semester notes:', err);
      } finally {
        if (isMounted) setNotesLoading(false);
      }
    };

    fetchNotes();
    return () => {
      isMounted = false;
    };
  }, [resolvedSemesterId, resolvedSubjectId, subjectParam]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (resolvedSemesterId) {
        await dispatch(fetchSubjectsBySemester(resolvedSemesterId));
        const queryParams = {
          semester: resolvedSemesterId,
          all: 'true'
        };
        if (resolvedSubjectId) {
          queryParams.subject = resolvedSubjectId;
        }
        const res = await noteApi.getMyNotes(queryParams);
        setNotes(res?.data || []);
      }
      toast.success('Notes refreshed');
    } catch (err) {
      toast.error('Failed to refresh notes');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const handleAppRefresh = () => handleRefresh();
    window.addEventListener('app:refresh', handleAppRefresh);
    return () => window.removeEventListener('app:refresh', handleAppRefresh);
  }, [resolvedSemesterId, resolvedSubjectId]);

  // Group notes by subject ID for subject-wise cards
  const notesBySubject = useMemo(() => {
    const map = {};
    (notes || []).forEach((note) => {
      const subId = note.subject?._id || note.subject;
      if (subId) {
        if (!map[subId]) map[subId] = [];
        map[subId].push(note);
      }
    });
    return map;
  }, [notes]);

  const handleOpenNote = useCallback(
    (note) => {
      if (!note) return;
      const enrichedNote = {
        ...note,
        course:
          typeof note.course === 'object' && note.course !== null
            ? note.course
            : selectedCourse || note.course,
        semester:
          typeof note.semester === 'object' && note.semester !== null
            ? note.semester
            : currentSemester || note.semester,
        subject:
          typeof note.subject === 'object' && note.subject !== null
            ? note.subject
            : subjects.find((s) => s._id === (note.subject?._id || note.subject)) || note.subject
      };
      setSelectedPdfNote(enrichedNote);
    },
    [selectedCourse, currentSemester, subjects]
  );

  const handleToggleVisibility = async (note) => {
    if (!note?._id) return;
    const currentVis = (note.visibility || 'PRIVATE').toUpperCase();
    const nextVis = currentVis === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    setUpdatingVisibilityId(note._id);
    try {
      const res = await noteApi.updateNote(note._id, { visibility: nextVis });
      if (res && res.success) {
        toast.success(
          nextVis === 'PUBLIC'
            ? 'Note is now Public (visible to everyone in explore)'
            : 'Note is now Private (visible only to you)'
        );
        // Optimistically update notes state in current view
        setNotes((prev) =>
          prev.map((n) => (n._id === note._id ? { ...n, visibility: nextVis } : n))
        );
      } else {
        throw new Error(res?.message || 'Failed to update note visibility');
      }
    } catch (err) {
      console.error('Error changing visibility:', err);
      toast.error(err.message || 'Failed to update visibility');
    } finally {
      setUpdatingVisibilityId(null);
    }
  };

  const isLoading = courseLoading && !currentSemester && (!myCourses || myCourses.length === 0);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <p className="text-sm text-slate-500">Loading semester curriculum & notes...</p>
      </div>
    );
  }

  const semesterDisplayName =
    currentSemester?.name ||
    (currentSemester?.semesterNumber
      ? `Semester ${currentSemester.semesterNumber}`
      : isNaN(Number(semesterParam))
      ? 'Semester'
      : `Semester ${semesterParam}`);

  const navigateToAllSubjects = () => {
    const semNum = currentSemester?.semesterNumber || semesterParam || 1;
    const cParam = selectedCourse?.slug || selectedCourse?.name || courseParam || '';
    navigate(
      cParam
        ? `/student/my-study/semester?course=${encodeURIComponent(cParam)}&semester=${semNum}`
        : `/student/my-study/semester?semester=${semNum}`
    );
  };

  const backToMyStudy = () => {
    const cParam = selectedCourse?.slug || selectedCourse?.name || courseParam || '';
    navigate(cParam ? `/student/my-study?course=${encodeURIComponent(cParam)}` : '/student/my-study');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'My Study', onClick: backToMyStudy },
          {
            label: semesterDisplayName,
            onClick: subjectParam ? navigateToAllSubjects : undefined
          },
          ...(currentSubject
            ? [{ label: currentSubject.name }]
            : subjectParam
            ? [{ label: decodeURIComponent(subjectParam) }]
            : [])
        ]}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {currentSubject ? currentSubject.name : semesterDisplayName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedCourse?.name ? `${selectedCourse.name} • ` : ''}
            {semesterDisplayName}
            {currentSubject?.subjectCode ? ` • (${currentSubject.subjectCode})` : ''}
            {` • ${notes.length} ${notes.length === 1 ? 'Note' : 'Notes'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subjectParam ? (
            <button
              onClick={navigateToAllSubjects}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Subjects</span>
            </button>
          ) : (
            <button
              onClick={backToMyStudy}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Semesters</span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Refresh notes & subjects"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              const courseParam = selectedCourse?.slug || selectedCourse?.name || '';
              navigate(
                courseParam && semesterParam
                  ? `/student/add-notes?step=3&course=${encodeURIComponent(courseParam)}&semester=${encodeURIComponent(semesterParam)}`
                  : '/student/add-notes?step=1'
              );
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Upload Note</span>
          </button>
        </div>
      </div>

      {/* ================= SUBJECT-WISE NOTES ================= */}
      <div className="space-y-6">
        {displaySubjects.length === 0 ? (
          <div className="p-5 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {subjectParam ? 'Subject not found' : `No subjects registered for ${semesterDisplayName}`}
              </h3>
            </div>
            <div className="flex items-center justify-center gap-2">
              {subjectParam && (
                <button
                  onClick={navigateToAllSubjects}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View All Subjects</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          displaySubjects.map((sub) => {
            const subjectNotes = notesBySubject[sub._id] || [];

            return (
              <div
                key={sub._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 px-2 py-2"
              >
                {/* Subject Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] dark:bg-indigo-950/60 text-[var(--primary-dark)] dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {sub.name}
                      </h2>
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-wrap">
                        <span>{sub.subjectCode || 'Active Subject'} • {subjectNotes.length} notes</span>
                        {subjectNotes.length > 0 && (
                          <div className="flex items-center gap-2 normal-case font-medium pl-2.5 border-l border-slate-200 dark:border-slate-800">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold" title={`${subjectNotes.filter((n) => (n.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC').length} Public Notes`}>
                              <Globe className="w-3 h-3" />
                              <span>{subjectNotes.filter((n) => (n.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC').length} Public</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold" title={`${subjectNotes.filter((n) => (n.visibility || 'PRIVATE').toUpperCase() !== 'PUBLIC').length} Private Notes`}>
                              <Lock className="w-3 h-3" />
                              <span>{subjectNotes.filter((n) => (n.visibility || 'PRIVATE').toUpperCase() !== 'PUBLIC').length} Private</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     
                    <button
                      onClick={() => {
                        const courseParam = selectedCourse?.slug || selectedCourse?.name || '';
                        navigate(
                          courseParam && semesterParam
                            ? `/student/add-notes?step=4&course=${encodeURIComponent(courseParam)}&semester=${encodeURIComponent(semesterParam)}&subject=${encodeURIComponent(sub.name)}`
                            : '/student/add-notes?step=1'
                        );
                      }}
                      className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Upload Note</span>
                    </button>
                  </div>
                </div>

                {/* Subject Notes Table */}
                {subjectNotes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse text-xs table-fixed">
                      <colgroup>
                        <col className="w-[32%]" />
                        <col className="w-[18%]" />
                        <col className="w-[16%]" />
                        <col className="w-[10%]" />
                        <col className="w-[8%]" />
                        <col className="w-[16%]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/40">
                          <th className="py-2.5 px-3">Note Details</th>
                          <th className="py-2.5 px-3">Visibility</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Format</th>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {subjectNotes.map((note) => {
                          const fileExt = (
                            note.fileType ||
                            note.fileName?.split('.').pop() ||
                            'PDF'
                          ).toUpperCase();

                          const orgBadge = note.unitName ? note.unitName : 'General Note';
                          const isPublic = (note.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC';
                          const isUpdating = updatingVisibilityId === note._id;

                          return (
                            <tr
                              key={note._id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                              {/* Title & Description */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-start gap-2">
                                  <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[var(--primary)] shrink-0 mt-0.5 transition-colors" />
                                  <div className="space-y-0.5 min-w-0">
                                    <h4
                                      className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[var(--primary)] transition-colors truncate"
                                      title={note.title}
                                    >
                                      {note.title}
                                    </h4>
                                    {note.description && (
                                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                        {note.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Visibility Column with Interactive Change Feature */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility(note)}
                                  disabled={isUpdating}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                    isPublic
                                      ? 'bg-emerald-50 dark:bg-[var(--secondary)] text-emerald-700 dark:text-emerald-300'
                                      : 'bg-amber-50 dark:bg-[var(--secondary)] text-amber-700 dark:text-amber-300'
                                  }`}
                                  title={
                                    isPublic
                                      ? 'Public Note: Anyone can discover and read. Click to make Private.'
                                      : 'Private Note: Only you can view. Click to make Public.'
                                  }
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-current" />
                                  ) : isPublic ? (
                                    <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  )}
                                  <span>{isPublic ? 'Public' : 'Private'}</span>
                                  <span className="text-[9px] opacity-60 ml-0.5 underline">
                                    {isUpdating ? 'Saving...' : 'Change'}
                                  </span>
                                </button>
                              </td>

                              {/* Organization Type */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {orgBadge}
                                </span>
                              </td>

                              {/* File Format Badge */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--primary-light)] dark:bg-indigo-950/60 text-[var(--primary-dark)] dark:text-indigo-400">
                                  {fileExt}
                                </span>
                              </td>

                              {/* Size / Pages */}
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                                {note.fileSize
                                  ? `${(note.fileSize / (1024 * 1024)).toFixed(1)} MB`
                                  : note.pageCount
                                  ? `${note.pageCount} pgs`
                                  : '—'}
                              </td>

                              {/* Action Link */}
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                {note.fileUrl ? (
                                  <button onClick={() => handleOpenNote(note)} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-[var(--primary-light)] dark:bg-indigo-950/60 text-[var(--primary-dark)] dark:text-indigo-300 hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Open Note</span>
                                  </button>) : (
                                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">No file</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                    <p className="italic">No notes uploaded for this subject yet.</p>
                     
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PDF View Modal */}
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

export default SemesterPage;
