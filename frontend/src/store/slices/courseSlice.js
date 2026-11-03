import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { academicApi } from '../../services/academicApi';

// Async Thunks for clean API handling with Redux
export const fetchMyCourses = createAsyncThunk(
  'course/fetchMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await academicApi.getMyCourses({ all: 'true' });
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch courses');
    }
  }
);

export const fetchAllCourses = createAsyncThunk(
  'course/fetchAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await academicApi.getAllCourses({ all: 'true' });
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch all courses');
    }
  }
);

export const fetchSemestersByCourse = createAsyncThunk(
  'course/fetchSemestersByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await academicApi.getSemestersByCourse(courseId);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch semesters');
    }
  }
);

export const fetchSubjectsBySemester = createAsyncThunk(
  'course/fetchSubjectsBySemester',
  async (semesterId, { rejectWithValue }) => {
    try {
      const res = await academicApi.getSubjectsBySemester(semesterId);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch subjects');
    }
  }
);

// Performance-optimized cached bulk subject fetch for semesters
export const fetchSubjectsForSemesters = createAsyncThunk(
  'course/fetchSubjectsForSemesters',
  async (semesterIds, { getState, rejectWithValue }) => {
    try {
      const state = getState().course;
      const cached = state.subjectsBySemester || {};
      const missingIds = (semesterIds || []).filter(
        (id) => id && cached[id] === undefined
      );

      // If all are already in cache with updated counts, return existing without network calls
      if (missingIds.length === 0) {
        return cached;
      }

      const results = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const res = await academicApi.getSubjectsBySemester(id);
            return { semesterId: id, subjects: res?.data || [] };
          } catch {
            return { semesterId: id, subjects: [] };
          }
        })
      );

      const updated = { ...cached };
      results.forEach((r) => {
        updated[r.semesterId] = r.subjects;
      });
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch subjects for semesters');
    }
  }
);


const initialState = {
  // Lists
  myCourses: [],
  allCourses: [],
  semesters: [],
  semestersByCourse: {}, // Cached map of courseId -> semesters
  subjects: [],
  subjectsBySemester: {}, // Cached map of semesterId -> subjects

  // Active selections in builder
  selectedCourse: null,
  selectedSemester: null,
  selectedSubject: null,
  loading: false,
  semestersLoading: false,

  // Stepper state (1: Course, 2: Semester, 3: Subject)
  currentStep: 1,
  isCompleted: false,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    // Stepper navigation
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Step 1: Select or create course
    setSelectedCourse: (state, action) => {
      const course = action.payload;
      const isDifferent = !state.selectedCourse || state.selectedCourse._id !== course?._id;
      state.selectedCourse = course;

      if (isDifferent) {
        // Reset dependent selections if parent changes
        state.selectedSemester = null;
        state.selectedSubject = null;
        // Instantly populate semesters from cache if available for zero-lag switching
        state.semesters =
          course?._id && state.semestersByCourse[course._id]
            ? state.semestersByCourse[course._id]
            : [];
        state.subjects = [];
        state.isCompleted = false;
      }
    },

    addCourse: (state, action) => {
      const newCourse = action.payload;
      if (!newCourse?._id) return;
      // Deduplicate by _id
      state.allCourses = [newCourse, ...state.allCourses.filter((c) => c._id !== newCourse._id)];
      state.myCourses = [newCourse, ...state.myCourses.filter((c) => c._id !== newCourse._id)];
      state.selectedCourse = newCourse;
      state.selectedSemester = null;
      state.selectedSubject = null;
      state.semesters = [];
      state.subjects = [];
      state.isCompleted = false;
    },

    // Step 2: Select or create semester
    setSelectedSemester: (state, action) => {
      const semester = action.payload;
      const isDifferent = !state.selectedSemester || state.selectedSemester._id !== semester?._id;
      state.selectedSemester = semester;

      if (isDifferent) {
        // Reset dependent selections if parent changes
        state.selectedSubject = null;
        state.subjects = [];
        state.isCompleted = false;
      }
    },

    addSemester: (state, action) => {
      const newSemester = action.payload;
      if (!newSemester?._id) return;
      state.semesters = [...state.semesters.filter((s) => s._id !== newSemester._id), newSemester];
      const courseId =
        typeof newSemester.course === 'object' && newSemester.course !== null
          ? newSemester.course._id
          : newSemester.course;
      if (courseId && state.semestersByCourse[courseId]) {
        state.semestersByCourse[courseId] = [
          ...state.semestersByCourse[courseId].filter((s) => s._id !== newSemester._id),
          newSemester
        ].sort((a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0));
      }
      state.selectedSemester = newSemester;
      state.selectedSubject = null;
      state.subjects = [];
      state.isCompleted = false;
    },

    // Step 3: Select or create subject
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },

    addSubject: (state, action) => {
      const newSubject = action.payload;
      if (!newSubject?._id) return;
      state.subjects = [...state.subjects.filter((s) => s._id !== newSubject._id), newSubject];
      state.selectedSubject = newSubject;
    },

    updateSubjectInList: (state, action) => {
      const updated = action.payload;
      if (!updated?._id) return;
      state.subjects = state.subjects.map((s) => (s._id === updated._id ? { ...s, ...updated } : s));
      if (state.selectedSubject?._id === updated._id) {
        state.selectedSubject = { ...state.selectedSubject, ...updated };
      }
    },

    // Completion & Reset
    setIsCompleted: (state, action) => {
      state.isCompleted = action.payload;
    },

    resetCourseBuilder: (state) => {
      state.selectedCourse = null;
      state.selectedSemester = null;
      state.selectedSubject = null;
      state.semesters = [];
      state.subjects = [];
      state.currentStep = 1;
      state.isCompleted = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMyCourses
      .addCase(fetchMyCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses = action.payload;
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchAllCourses (Shared catalog across platform)
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.allCourses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchSemestersByCourse
      .addCase(fetchSemestersByCourse.pending, (state, action) => {
        const courseId = action.meta?.arg;
        if (!courseId || !state.semestersByCourse[courseId]) {
          state.semestersLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchSemestersByCourse.fulfilled, (state, action) => {
        state.semestersLoading = false;
        state.loading = false;
        const list = action.payload || [];
        const sortedList = [...list].sort(
          (a, b) => (a.semesterNumber || 0) - (b.semesterNumber || 0)
        );
        const courseId = action.meta?.arg;
        if (courseId) {
          state.semestersByCourse[courseId] = sortedList;
        }
        if (!state.selectedCourse || !courseId || state.selectedCourse._id === courseId) {
          state.semesters = sortedList;
        }
      })
      .addCase(fetchSemestersByCourse.rejected, (state, action) => {
        state.semestersLoading = false;
        state.loading = false;
        state.error = action.payload;
      })

      // fetchSubjectsBySemester
      .addCase(fetchSubjectsBySemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectsBySemester.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
        if (action.meta?.arg) {
          state.subjectsBySemester = {
            ...state.subjectsBySemester,
            [action.meta.arg]: action.payload
          };
        }
      })
      .addCase(fetchSubjectsBySemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchSubjectsForSemesters (cached bulk)
      .addCase(fetchSubjectsForSemesters.fulfilled, (state, action) => {
        state.subjectsBySemester = { ...state.subjectsBySemester, ...action.payload };
      })
  },
});

export const {
  setCurrentStep,
  setLoading,
  setSelectedCourse,
  addCourse,
  setSelectedSemester,
  addSemester,
  setSelectedSubject,
  addSubject,
  updateSubjectInList,
  setIsCompleted,
  resetCourseBuilder,
} = courseSlice.actions;

export default courseSlice.reducer;
