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
      console.error('🔴 REDUX: Setting selectedSubchapter 🔴', {
        oldValue: state.selectedSubchapter,
        newValue: action.payload,
        type: typeof action.payload
      });
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
      console.error('🔴 REDUX: Setting tasksLoading 🔴', {
        subchapterId,
        loading,
        subchapterIdType: typeof subchapterId
      });
      state.tasksLoading[subchapterId] = loading;
    },
    setTasks: (state, action) => {
      const { subchapterId, tasks } = action.payload;
      console.error('🔴 REDUX: Setting tasks 🔴', {
        subchapterId,
        tasksLength: tasks.length,
        subchapterIdType: typeof subchapterId,
        tasks
      });
      state.tasks[subchapterId] = tasks;
      state.noTasksSubchapters[subchapterId] = false;
      console.error('🔴 REDUX: State after setting tasks 🔴', {
        subchapterId,
        storedTasks: state.tasks[subchapterId],
        storedTasksArray: Array.isArray(state.tasks[subchapterId]),
        storedTasksLength: state.tasks[subchapterId] ? state.tasks[subchapterId].length : 0
      });
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