import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunk for fetching chapters by subject
export const fetchChaptersBySubject = createAsyncThunk(
  'chapters/fetchChaptersBySubject',
  async (subjectId, { rejectWithValue }) => {
    try {
      const chapters = await api.getChaptersBySubject(subjectId);
      return { subjectId, chapters };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching attempt count by chapter
export const fetchAttemptCountByChapter = createAsyncThunk(
  'chapters/fetchAttemptCountByChapter',
  async (chapterId, { rejectWithValue }) => {
    try {
      const count = await api.getAttemptCountByChapter(chapterId);
      return { chapterId, count };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  chaptersBySubject: {},
  attemptCountByChapter: {},
  status: {
    chapters: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    attemptCounts: 'idle'
  },
  error: {
    chapters: null,
    attemptCounts: null
  }
};

// Chapters slice
const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchChaptersBySubject
      .addCase(fetchChaptersBySubject.pending, (state) => {
        state.status.chapters = 'loading';
      })
      .addCase(fetchChaptersBySubject.fulfilled, (state, action) => {
        state.status.chapters = 'succeeded';
        state.chaptersBySubject[action.payload.subjectId] = action.payload.chapters;
        state.error.chapters = null;
      })
      .addCase(fetchChaptersBySubject.rejected, (state, action) => {
        state.status.chapters = 'failed';
        state.error.chapters = action.payload;
      })

      // Handle fetchAttemptCountByChapter
      .addCase(fetchAttemptCountByChapter.pending, (state) => {
        state.status.attemptCounts = 'loading';
      })
      .addCase(fetchAttemptCountByChapter.fulfilled, (state, action) => {
        state.status.attemptCounts = 'succeeded';
        state.attemptCountByChapter[action.payload.chapterId] = action.payload.count;
        state.error.attemptCounts = null;
      })
      .addCase(fetchAttemptCountByChapter.rejected, (state, action) => {
        state.status.attemptCounts = 'failed';
        state.error.attemptCounts = action.payload;
      });
  }
});

// Selectors
export const selectChaptersBySubject = (state, subjectId) =>
  state.chapters.chaptersBySubject[subjectId] || [];
export const selectChaptersStatus = (state) => state.chapters.status.chapters;
export const selectChaptersError = (state) => state.chapters.error.chapters;

export const selectAttemptCountByChapter = (state, chapterId) =>
  state.chapters.attemptCountByChapter[chapterId] || 0;
export const selectAttemptCountsStatus = (state) => state.chapters.status.attemptCounts;
export const selectAttemptCountsError = (state) => state.chapters.error.attemptCounts;

export default chaptersSlice.reducer;