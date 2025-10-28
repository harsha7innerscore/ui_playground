import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunk for fetching tasks by subchapter
export const fetchTasksBySubchapter = createAsyncThunk(
  'tasks/fetchTasksBySubchapter',
  async (subchapterId, { rejectWithValue }) => {
    try {
      const tasks = await api.getTasksBySubchapter(subchapterId);
      return { subchapterId, tasks };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  tasksBySubchapter: {},
  status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
  error: null
};

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksBySubchapter.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksBySubchapter.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasksBySubchapter[action.payload.subchapterId] = action.payload.tasks;
        state.error = null;
      })
      .addCase(fetchTasksBySubchapter.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectTasksBySubchapter = (state, subchapterId) =>
  state.tasks.tasksBySubchapter[subchapterId] || [];
export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;

export default tasksSlice.reducer;