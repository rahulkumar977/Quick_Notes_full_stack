import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  fetchMyCourses,
  fetchAllCourses,
  fetchSemestersByCourse,
  fetchSubjectsForSemesters,
  setSelectedCourse
} from '../../../store/slices/courseSlice';
import {
  Calendar,
  Plus,
  Loader2,
  FileText,
  Globe,
  Lock,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to reliably match course by ID, slug, name, or courseCode across case & dash/space formats
const courseMatchesQuery = (course, query) => {
  if (!course || !query) return false;
  const cleanQ = decodeURIComponent(String(query)).trim().toLowerCase();
  const qNorm = cleanQ.replace(/[-_\s]+/g, '');
  if (!qNorm) return false;

  if (course._id && String(course._id) === query) return true;

  if (course.slug) {
    const s = String(course.slug).toLowerCase();
    if (s === cleanQ || s.replace(/[-_\s]+/g, '') === qNorm) return true;
  }

  if (course.name) {
    const n = String(course.name).toLowerCase();
    if (n === cleanQ || n.replace(/[-_\s]+/g, '') === qNorm) return true;
  }

  if (course.courseCode) {
    const c = String(course.courseCode).toLowerCase();
    if (c === cleanQ || c.replace(/[-_\s]+/g, '') === qNorm) return true;
  }

  return false;
};

export const MyStudyPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const courseQuery = searchParams.get('course');

  // Pure Redux state from courseSlice for maximum performance & caching
  const {
    myCourses,
    allCourses,
    selectedCourse,
    semesters,
    semestersByCourse,
    subjectsBySemester,
    loading,
    semestersLoading
  } = useSelector((state) => state.course);

  // 1. Fetch courses if not already cached
  useEffect(() => {
    if (!myCourses || myCourses.length === 0) {
      dispatch(fetchMyCourses());
    }
    if (!allCourses || allCourses.length === 0) {
      dispatch(fetchAllCourses());
    }
  }, [dispatch, myCourses?.length, allCourses?.length]);

  // Combined available courses: personal courses with note counts + platform catalog
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

  // 2. Select initial or updated active course based on URL (?course=...) or localStorage
  useEffect(() => {
    if (availableCourses.length === 0) return;

    let targetCourse = null;

    // Priority 1: Match from URL parameter (?course=placement-preparation / ?course=btech)
    if (courseQuery) {
      targetCourse = availableCourses.find((c) => courseMatchesQuery(c, courseQuery));
    }

    // Priority 2: Match from localStorage (only if no URL query was specified)
    if (!targetCourse && !courseQuery) {
      const savedId = localStorage.getItem('my_study_selected_course');
      if (savedId) {
        targetCourse = availableCourses.find((c) => c._id === savedId);
      }
    }

    // Priority 3: Fallback to existing selectedCourse (if valid) or first available
    if (!targetCourse) {
      targetCourse =
        selectedCourse && availableCourses.some((c) => c._id === selectedCourse._id)
          ? selectedCourse
          : availableCourses[0];
    }

    if (targetCourse) {
      if (!selectedCourse || selectedCourse._id !== targetCourse._id) {
        dispatch(setSelectedCourse(targetCourse));
      }

      localStorage.setItem('my_study_selected_course', targetCourse._id);

      // Only sync URL query param if it does not already match the target course
      if (!courseMatchesQuery(targetCourse, courseQuery)) {
        const expectedParam = targetCourse.slug || targetCourse.name;
        setSearchParams({ course: expectedParam }, { replace: true });
      }
    }
  }, [availableCourses, courseQuery, dispatch, setSearchParams]);

  // 3. When selected course is active, fetch its semesters if not already cached
  useEffect(() => {
    if (selectedCourse?._id) {
      if (!semestersByCourse?.[selectedCourse._id]) {
        dispatch(fetchSemestersByCourse(selectedCourse._id));
      }
    }
  }, [selectedCourse?._id, semestersByCourse, dispatch]);

  // 4. Batch-fetch subjects only for active semesters with notes
  const mySemesters = useMemo(() => {
    return (semesters || []).filter((sem) => (sem.noteCount || sem.myNoteCount || 0) > 0);
  }, [semesters]);

  useEffect(() => {
    if (mySemesters.length > 0) {
      const semesterIds = mySemesters.map((s) => s._id);
      dispatch(fetchSubjectsForSemesters(semesterIds));
    }
  }, [mySemesters, dispatch]);

  // Course switcher handler: updates Redux, localStorage, and URL query param
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchMyCourses()).unwrap(),
        dispatch(fetchAllCourses()).unwrap()
      ]);
      if (selectedCourse?._id) {
        await dispatch(fetchSemestersByCourse(selectedCourse._id)).unwrap();
      }
      toast.success('Curriculum refreshed');
    } catch {
      toast.error('Failed to refresh curriculum');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const handleAppRefresh = () => handleRefresh();
    window.addEventListener('app:refresh', handleAppRefresh);
    return () => window.removeEventListener('app:refresh', handleAppRefresh);
  }, [selectedCourse?._id]);

  const handleCourseChange = (courseId) => {
    const course = availableCourses.find((c) => c._id === courseId);
    if (course) {
      dispatch(setSelectedCourse(course));
      localStorage.setItem('my_study_selected_course', course._id);
      const courseParam = course.slug || course.name;
      setSearchParams({ course: courseParam });
    }
  };

  const isInitialLoading = loading && availableCourses.length === 0;
  const isSemestersLoading = semestersLoading && (!semesters || semesters.length === 0);

  if (isInitialLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <p className="text-sm text-slate-500">Loading your study curriculum...</p>
      </div>
    );
  }

  const currentCourseParam = selectedCourse?.slug || selectedCourse?.name || '';

  return (
    <div className="animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <Breadcrumb items={[{ label: 'My Study' }]} />

      {/* Course Switcher */}
      {availableCourses.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-transparent dark:border-slate-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase px-2">Course:</span>
            {availableCourses.length > 1 ? (
              <select
                value={selectedCourse?._id || ''}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {availableCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.noteCount ? `(${c.noteCount} notes)` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                {selectedCourse?.name || availableCourses[0]?.name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Refresh courses and semesters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* ================= SEMESTERS GRID ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Available Semesters ({mySemesters.length})
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">Click a semester to open notes</span>
        </div>

        {isSemestersLoading ? (
          <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)] mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading your notes and semesters...
            </p>
          </div>
        ) : availableCourses.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Calendar className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No courses created yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven't created any course yet. Create a course to add semesters and study notes.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/add-notes?step=1')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Course</span>
            </button>
          </div>
        ) : mySemesters.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Calendar className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No notes available in {selectedCourse?.name || 'this course'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven't uploaded any notes in this course yet. Upload notes to see your semesters here.
              </p>
            </div>
            <button
              onClick={() => {
                navigate(currentCourseParam ? `/student/add-notes?step=2&course=${encodeURIComponent(currentCourseParam)}` : '/student/add-notes?step=1');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Upload Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mySemesters.map((sem) => {
              const semNumber = sem.semesterNumber || 1;
              // Only include subjects where student has uploaded notes (strictly noteCount > 0)
              const semSubjects = (subjectsBySemester[sem._id] || []).filter(
                (sub) => (sub.noteCount || 0) > 0
              );

              return (
                <div
                  key={sem._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] p-5 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Term Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--primary-light)] dark:bg-indigo-950/60 text-[var(--primary-dark)] dark:text-indigo-400">
                        Term {semNumber}
                      </span>
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[var(--primary)] transition-colors" />
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {/* Semester Name */}
                        <h3
                          onClick={() =>
                            navigate(
                              currentCourseParam
                                ? `/student/my-study/semester?course=${encodeURIComponent(currentCourseParam)}&semester=${semNumber}`
                                : `/student/my-study/semester?semester=${semNumber}`
                            )
                          }
                          className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[var(--primary)] transition-colors line-clamp-1 cursor-pointer"
                          title={`View Semester ${semNumber} notes`}
                        >
                          {sem.name || `Semester ${semNumber}`}
                        </h3>

                        {/* Notes Count */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{sem.noteCount} Notes uploaded</span>
                          </div>
                          {(sem.publicNoteCount > 0 || sem.privateNoteCount > 0) && (
                            <div className="flex items-center gap-1.5 text-[10px] pl-1.5 border-l border-slate-200 dark:border-slate-800">
                              {sem.publicNoteCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold" title={`${sem.publicNoteCount} Public Note${sem.publicNoteCount > 1 ? 's' : ''}`}>
                                  <Globe className="w-2.5 h-2.5" />
                                  <span>{sem.publicNoteCount}</span>
                                </span>
                              )}
                              {sem.privateNoteCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold" title={`${sem.privateNoteCount} Private Note${sem.privateNoteCount > 1 ? 's' : ''}`}>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{sem.privateNoteCount}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const courseParam = selectedCourse?.slug || selectedCourse?.name || '';
                          navigate(
                            courseParam
                              ? `/student/add-notes?step=3&course=${encodeURIComponent(courseParam)}&semester=${semNumber}`
                              : `/student/add-notes?step=3&semester=${semNumber}`
                          );
                        }}
                        className="py-1.5 px-2.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--secondary-light)] bg-[var(--primary-light)] dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        title={`Upload note in ${sem.name || `Semester ${semNumber}`}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload Note</span>
                      </button>
                    </div>

                    {/* Subject Names List */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>Subjects with Notes</span>
                        <span>{semSubjects.length}</span>
                      </div>

                      {semSubjects.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes uploaded in subjects yet</p>
                      ) : (
                        <ul className="space-y-1">
                          {semSubjects.map((sub) => (
                            <li
                              key={sub._id}
                              className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[var(--primary)] flex items-center justify-between gap-1.5 transition-colors group/item"
                            >
                              <div
                                onClick={() =>
                                  navigate(
                                    currentCourseParam
                                      ? `/student/my-study/semester?course=${encodeURIComponent(currentCourseParam)}&semester=${semNumber}&subject=${encodeURIComponent(
                                          sub.name
                                        )}`
                                      : `/student/my-study/semester?semester=${semNumber}&subject=${encodeURIComponent(
                                          sub.name
                                        )}`
                                  )
                                }
                                className="flex items-center gap-1.5 truncate cursor-pointer hover:underline flex-1"
                                title={`View ${sub.name} notes`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                                <span className="truncate">{sub.name}</span>
                                {sub.subjectCode && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 uppercase">
                                    ({sub.subjectCode})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  {sub.noteCount} {sub.noteCount === 1 ? 'note' : 'notes'}
                                </span>

                                {/* Visibility Icons on the right */}
                                <div className="flex items-center gap-1">
                                  {sub.publicCount > 0 && (
                                    <span
                                      className="inline-flex items-center justify-center p-0.5 rounded text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                                      title={`${sub.publicCount} Public note${sub.publicCount > 1 ? 's' : ''}`}
                                    >
                                      <Globe className="w-3 h-3" />
                                    </span>
                                  )}
                                  {sub.privateCount > 0 && (
                                    <span
                                      className="inline-flex items-center justify-center p-0.5 rounded text-amber-600 dark:text-amber-400 hover:scale-110 transition-transform"
                                      title={`${sub.privateCount} Private note${sub.privateCount > 1 ? 's' : ''}`}
                                    >
                                      <Lock className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const courseParam = selectedCourse?.slug || selectedCourse?.name || '';
                                    navigate(
                                      courseParam
                                        ? `/student/add-notes?step=4&course=${encodeURIComponent(courseParam)}&semester=${semNumber}&subject=${encodeURIComponent(sub.name)}`
                                        : `/student/add-notes?step=4&semester=${semNumber}&subject=${encodeURIComponent(sub.name)}`
                                    );
                                  }}
                                  className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-[var(--primary)] hover:bg-[var(--primary-light)] dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                                  title={`Upload note for ${sub.name}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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

export default MyStudyPage;