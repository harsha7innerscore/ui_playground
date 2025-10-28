import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunk for fetching subchapters by chapter
export const fetchSubchaptersByChapter = createAsyncThunk(
  'subchapters/fetchSubchaptersByChapter',
  async (chapterId, { rejectWithValue }) => {
    try {
      const subchapters = await api.getSubchaptersByChapter(chapterId);
      return { chapterId, subchapters };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching last attempt by subchapter
export const fetchLastAttemptBySubchapter = createAsyncThunk(
  'subchapters/fetchLastAttemptBySubchapter',
  async (subchapterId, { rejectWithValue }) => {
    try {
      const lastAttempt = await api.getLastAttemptBySubchapter(subchapterId);
      return { subchapterId, lastAttempt };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  subchaptersByChapter: {},
  lastAttemptBySubchapter: {},
  status: {
    subchapters: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    lastAttempts: 'idle'
  },
  error: {
    subchapters: null,
    lastAttempts: null
  }
};

// Subchapters slice
const subchaptersSlice = createSlice({
  name: 'subchapters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchSubchaptersByChapter
      .addCase(fetchSubchaptersByChapter.pending, (state) => {
        state.status.subchapters = 'loading';
      })
      .addCase(fetchSubchaptersByChapter.fulfilled, (state, action) => {
        state.status.subchapters = 'succeeded';
        state.subchaptersByChapter[action.payload.chapterId] = action.payload.subchapters;
        state.error.subchapters = null;
      })
      .addCase(fetchSubchaptersByChapter.rejected, (state, action) => {
        state.status.subchapters = 'failed';
        state.error.subchapters = action.payload;
      })

      // Handle fetchLastAttemptBySubchapter
      .addCase(fetchLastAttemptBySubchapter.pending, (state) => {
        state.status.lastAttempts = 'loading';
      })
      .addCase(fetchLastAttemptBySubchapter.fulfilled, (state, action) => {
        state.status.lastAttempts = 'succeeded';
        state.lastAttemptBySubchapter[action.payload.subchapterId] = action.payload.lastAttempt;
        state.error.lastAttempts = null;
      })
      .addCase(fetchLastAttemptBySubchapter.rejected, (state, action) => {
        state.status.lastAttempts = 'failed';
        state.error.lastAttempts = action.payload;
      });
  }
});

// Selectors
export const selectSubchaptersByChapter = (state, chapterId) =>
  state.subchapters.subchaptersByChapter[chapterId] || [];
export const selectSubchaptersStatus = (state) => state.subchapters.status.subchapters;
export const selectSubchaptersError = (state) => state.subchapters.error.subchapters;

export const selectLastAttemptBySubchapter = (state, subchapterId) =>
  state.subchapters.lastAttemptBySubchapter[subchapterId] || null;
export const selectLastAttemptsStatus = (state) => state.subchapters.status.lastAttempts;
export const selectLastAttemptsError = (state) => state.subchapters.error.lastAttempts;

export default subchaptersSlice.reducer;