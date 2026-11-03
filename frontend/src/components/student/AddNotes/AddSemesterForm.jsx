import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  ArrowLeft,
  ArrowRight,
  Loader2,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { academicApi } from '../../../services/academicApi';
import {
  setSelectedSemester,
  addSemester,
  setCurrentStep,
  fetchSemestersByCourse
} from '../../../store/slices/courseSlice';

export const AddSemesterForm = () => {
  const dispatch = useDispatch();
  const { selectedCourse, selectedSemester, semesters, loading, error } = useSelector(
    (state) => state.course
  );

  // Check if selected course is Placement Preparation (case-insensitive)
  const isPlacementCourse = Boolean(
    (selectedCourse?.name && /placement/i.test(selectedCourse.name)) ||
    (selectedCourse?.slug && /placement/i.test(selectedCourse.slug)) ||
    (selectedCourse?.courseCode && /placement/i.test(selectedCourse.courseCode))
  );

  // Active semesters under currently selected course, sorted by semesterNumber
  const activeSemesters = (semesters || [])
    .filter((s) => s && s.isActive !== false)
    .sort((a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0));

  const [mode, setMode] = useState(() => (activeSemesters.length > 0 ? 'select' : 'create'));
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(selectedSemester?._id || '');

  // Form data for creating a new semester or placement module
  const [formData, setFormData] = useState({
    semesterNumber: selectedSemester?.semesterNumber || 1,
    name: selectedSemester?.name || (isPlacementCourse ? '' : 'Semester 1'),
  });

  const isMountedRef = useRef(true);
  const currentCourseIdRef = useRef(selectedCourse?._id);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch shared catalog of semesters for the selected course with stale-response protection
  useEffect(() => {
    currentCourseIdRef.current = selectedCourse?._id;
    if (selectedCourse?._id) {
      dispatch(fetchSemestersByCourse(selectedCourse._id));
    }
  }, [dispatch, selectedCourse?._id]);

  // Default mode and selection once semesters are loaded
  useEffect(() => {
    if (!hasAutoSwitched && activeSemesters.length > 0) {
      if (!selectedSemester) {
        setMode('select');
        setSelectedSemesterId(activeSemesters[0]._id);
      } else {
        setSelectedSemesterId(selectedSemester._id);
      }
      setHasAutoSwitched(true);
    }
  }, [activeSemesters, hasAutoSwitched, selectedSemester]);

  // Keep selectedSemesterId in sync if selectedSemester changes externally
  useEffect(() => {
    if (selectedSemester?._id) {
      setSelectedSemesterId(selectedSemester._id);
    }
  }, [selectedSemester]);

  // Auto-calculate next recommended semester number when switching to create mode
  const handleSwitchToCreate = () => {
    setMode('create');
    const existingNums = activeSemesters.map((s) => s.semesterNumber || 0);
    const nextNum =
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((n) => !existingNums.includes(n)) ||
      Math.min(Math.max(Math.max(...existingNums, 0) + 1, 1), 12);
    setFormData({
      semesterNumber: nextNum,
      name: isPlacementCourse ? '' : `Semester ${nextNum}`,
    });
  };

  const handleSemesterNumberChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const num = isNaN(val) ? '' : Math.max(1, Math.min(12, val));
    setFormData((prev) => ({
      ...prev,
      semesterNumber: num,
      name:
        !prev.name || prev.name.startsWith('Semester ')
          ? num ? `Semester ${num}` : ''
          : prev.name,
    }));
  };

  // Action 1: Select Existing Semester (Reuses existing database record, NEVER calls create API)
  const handleSelectExisting = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!selectedCourse?._id) {
      toast.error('Parent course missing. Please return to Step 1.');
      dispatch(setCurrentStep(1));
      return;
    }

    if (!selectedSemesterId) {
      toast.error(
        isPlacementCourse
          ? 'Please choose a track or module to continue'
          : 'Please choose a semester to continue'
      );
      return;
    }

    const sem = activeSemesters.find((s) => s._id === selectedSemesterId);
    if (!sem) {
      toast.error(isPlacementCourse ? 'Selected track not found' : 'Selected semester not found');
      return;
    }

    dispatch(setSelectedSemester(sem));
    dispatch(setCurrentStep(3));
    toast.success(`Selected "${sem.name}"`);
  };

  // Action 2: Create New Semester / Placement Track
  const handleCreateSemester = async (e) => {
    e.preventDefault();

    if (!selectedCourse?._id) {
      toast.error('Parent course missing. Please return to Step 1.');
      dispatch(setCurrentStep(1));
      return;
    }

    const trimmedName = formData.name?.trim() || '';

    // If placement course, name in characters is required
    if (isPlacementCourse && !trimmedName) {
      toast.error('Please enter a module or track name (e.g. DSA, Aptitude)');
      return;
    }

    // Auto-resolve next available semesterNumber (1 to 12)
    const existingNums = activeSemesters.map((s) => s.semesterNumber || 0);
    const fallbackNum =
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((n) => !existingNums.includes(n)) ||
      Math.min(Math.max((Math.max(...existingNums, 0)) + 1, 1), 12);

    let num = Number(formData.semesterNumber);
    if (!num || isNaN(num) || num < 1 || num > 12) {
      num = fallbackNum;
    }

    // If matching by name already exists, reuse it
    if (trimmedName) {
      const existingSameName = activeSemesters.find(
        (s) => s.name?.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingSameName) {
        toast(`"${existingSameName.name}" already exists. Selecting existing record.`, {
          icon: 'ℹ️',
        });
        dispatch(setSelectedSemester(existingSameName));
        dispatch(setCurrentStep(3));
        return;
      }
    }

    if (!isPlacementCourse) {
      // Check if this semester number already exists in this course
      const existingSameNumber = activeSemesters.find((s) => s.semesterNumber === num);
      if (existingSameNumber) {
        toast(`Semester ${num} already exists in this course. Reusing existing record.`, {
          icon: 'ℹ️',
        });
        dispatch(setSelectedSemester(existingSameNumber));
        dispatch(setCurrentStep(3));
        return;
      }
    } else {
      // For Placement Prep, avoid duplicate index collision
      if (activeSemesters.some((s) => s.semesterNumber === num)) {
        num = fallbackNum;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        semesterNumber: num,
        name: trimmedName || `Semester ${num}`,
      };

      const res = await academicApi.createSemester(selectedCourse._id, payload);
      if (res && res.success && res.data) {
        const returnedSemester = res.data;
        toast.success(
          res.message ||
            (isPlacementCourse
              ? `"${returnedSemester.name}" track added successfully!`
              : 'Semester saved successfully!')
        );

        // Update Redux state without duplicates
        dispatch(addSemester(returnedSemester));
        dispatch(setSelectedSemester(returnedSemester));

        if (isMountedRef.current) {
          dispatch(setCurrentStep(3));
        }
      } else {
        throw new Error(res?.message || 'Failed to create semester');
      }
    } catch (err) {
      toast.error(err.message || 'Could not create semester. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  // If no parent course is selected, block with clear recovery button
  if (!selectedCourse) {
    return (
      <div className="bg-white border border-slate-200/90 p-8 text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">No Course Selected</h3>
          <p className="text-xs text-slate-500">
            Please choose or create a course before configuring semesters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(setCurrentStep(1))}
          className="px-5 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Step 1: Course Selection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isPlacementCourse ? 'Choose or Add Placement Track' : 'Choose or Add Semester'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isPlacementCourse
              ? `Specify the preparation track, module, or topic for ${selectedCourse.name}.`
              : `Specify the academic term or semester index for ${selectedCourse.name}.`}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('select')}
            className={`px-3.5 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'select'
                ? 'bg-white dark:bg-slate-900 text-[var(--primary)] dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <span>Select Existing</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300">
              {activeSemesters.length}
            </span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToCreate}
            className={`px-3.5 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'create'
                ? 'bg-white dark:bg-slate-900 text-[var(--primary)] dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isPlacementCourse ? '+ Add Track / Module' : '+ Add New'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Select Existing Semester from Shared Catalog */}
      {mode === 'select' ? (
        <form onSubmit={handleSelectExisting} className="space-y-5">
          {/* Loading State */}
          {loading && activeSemesters.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)] mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loading {isPlacementCourse ? 'tracks' : 'semesters'} for {selectedCourse.name}...
              </p>
            </div>
          ) : error && activeSemesters.length === 0 ? (
            /* Error & Retry State */
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to load {isPlacementCourse ? 'tracks' : 'semesters'}</span>
              </div>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => dispatch(fetchSemestersByCourse(selectedCourse._id))}
                className="inline-flex items-center gap-1 text-[var(--primary)] font-bold hover:underline cursor-pointer pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : activeSemesters.length === 0 ? (
            /* Empty State */
            <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isPlacementCourse
                    ? 'No tracks or modules configured for Placement Preparation yet'
                    : 'No semesters configured for this course yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isPlacementCourse
                    ? 'Add your first preparation track (e.g. DSA, Aptitude) to continue.'
                    : 'Add the first semester (e.g. Semester 1) to continue.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSwitchToCreate}
                className="px-4 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] dark:bg-indigo-950/60 dark:text-indigo-400 hover:bg-[var(--primary-border)]/50 rounded-lg transition-colors cursor-pointer"
              >
                {isPlacementCourse ? '+ Add Track / Module' : '+ Add Semester 1'}
              </button>
            </div>
          ) : (
            /* Semester / Track Cards Selection */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Existing {isPlacementCourse ? 'Track' : 'Semester'} ({activeSemesters.length})
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Click a card to select</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeSemesters.map((s) => {
                  const isSelected = selectedSemesterId === s._id;
                  const semNum = s.semesterNumber || 1;
                  const hasSubjectCount = typeof s.subjectCount === 'number';
                  const hasNoteCount = typeof s.noteCount === 'number';

                  return (
                    <div
                      key={s._id}
                      onClick={() => setSelectedSemesterId(s._id)}
                      onDoubleClick={() => handleSelectExisting()}
                      className={`p-4 border rounded-none cursor-pointer transition-all flex flex-col justify-between space-y-3 group ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary-light)]/20 dark:bg-indigo-950/40 ring-1 ring-[var(--primary)] shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[var(--primary)] dark:hover:border-[var(--primary)] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Semester / Track Name & Info */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-[var(--primary)] transition-colors truncate">
                          {s.name || `Semester ${semNum}`}
                        </h4>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-[var(--primary)] shrink-0" />
                        )}
                      </div>

                      {/* Metadata / Counts */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{hasSubjectCount ? `${s.subjectCount} topics` : 'Active Track'}</span>
                        {hasNoteCount && <span>{s.noteCount} notes</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => dispatch(setCurrentStep(1))}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </button>

            <button
              type="submit"
              disabled={!selectedSemesterId || loading || activeSemesters.length === 0}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Subjects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* MODE 2: Add New Semester / Placement Track */
        <form onSubmit={handleCreateSemester} className="space-y-5">
          {isPlacementCourse ? (
            /* Placement Preparation: Text/Character Input */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Module / Track Name (Characters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Data Structures & Algorithms, Aptitude & Reasoning, Web Dev, Core CS..."
                  maxLength={100}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Type your preparation module or topic name in characters (e.g. DSA, Technical, HR, Aptitude).
                </p>
              </div>

              {/* Quick suggestions pills for Placement Preparation */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Suggested Modules:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Data Structures & Algorithms (DSA)',
                    'Aptitude & Reasoning',
                    'Web Development',
                    'Core CS Subjects',
                    'System Design',
                    'Mock Interviews'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, name: suggestion }))}
                      className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer border border-transparent dark:border-slate-700 font-medium"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Regular Course: Semester Number and Display Name */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Semester Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Semester Number (1 - 12) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="semesterNumber"
                  value={formData.semesterNumber}
                  onChange={handleSemesterNumberChange}
                  min={1}
                  max={12}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Identifies term index in the academic structure.
                </p>
              </div>

              {/* Semester Display Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Semester 1, 1st Year Autumn..."
                  maxLength={100}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Optional custom label (defaults to "Semester {formData.semesterNumber || 1}").
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => dispatch(setCurrentStep(1))}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </button>

            <button
              type="submit"
              disabled={submitting || (isPlacementCourse ? !formData.name?.trim() : !formData.semesterNumber)}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isPlacementCourse ? 'Saving Track...' : 'Saving Semester...'}</span>
                </>
              ) : (
                <>
                  <span>{isPlacementCourse ? 'Save Track & Proceed' : 'Create Semester & Proceed'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddSemesterForm;
