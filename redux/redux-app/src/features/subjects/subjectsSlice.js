import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunk for fetching subjects
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getSubjects();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  data: [],
  status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  error: null
};

// Subjects slice
const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectSubjects = (state) => state.subjects.data;
export const selectSubjectsStatus = (state) => state.subjects.status;
export const selectSubjectsError = (state) => state.subjects.error;

export default subjectsSlice.reducer;