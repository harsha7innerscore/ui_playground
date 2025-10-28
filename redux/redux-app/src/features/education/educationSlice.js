import { createSlice } from '@reduxjs/toolkit';

// Education slice for managing education-related state
const educationSlice = createSlice({
  name: 'education',
  initialState: {
    loading: false,
    error: '',
    noData: '',
    subjects: [],
    selectedSubject: null,
    selectedChapter: null,
    selectedSubchapter: null,
    expandedChapters: {},
    chapterProgress: {},
    subchapterLastTasks: {},
    tasks: {},
    tasksLoading: {},
    noTasksSubchapters: {}
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setNoData: (state, action) => {
      state.noData = action.payload;
    },
    setSubjects: (state, action) => {
      state.subjects = action.payload;
      state.noData = '';
    },
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },
    setSelectedChapter: (state, action) => {
      state.selectedChapter = action.payload;
    },
    setSelectedSubchapter: (state, action) => {
      state.selectedSubchapter = action.payload;
    },
    toggleChapter: (state, action) => {
      const chapterId = action.payload;
      state.expandedChapters[chapterId] = !state.expandedChapters[chapterId];
    },
    setChapterProgress: (state, action) => {
      state.chapterProgress = action.payload;
    },
    setSubchapterLastTasks: (state, action) => {
      state.subchapterLastTasks = action.payload;
    },
    setTasksLoading: (state, action) => {
      const { subchapterId, loading } = action.payload;
      state.tasksLoading[subchapterId] = loading;
    },
    setTasks: (state, action) => {
      const { subchapterId, tasks } = action.payload;
      state.tasks[subchapterId] = tasks;
      state.noTasksSubchapters[subchapterId] = false;
    },
    setNoTasks: (state, action) => {
      state.noTasksSubchapters[action.payload] = true;
    },
    resetView: (state) => {
      state.selectedSubject = null;
      state.selectedChapter = null;
      state.selectedSubchapter = null;
      state.expandedChapters = {};
      state.tasks = {};
    }
  }
});

export const { actions, reducer } = educationSlice;
export const educationActions = actions;
export default reducer;