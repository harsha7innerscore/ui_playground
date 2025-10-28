import { configureStore } from '@reduxjs/toolkit';
import subjectsReducer from '../features/subjects/subjectsSlice';
import chaptersReducer from '../features/chapters/chaptersSlice';
import subchaptersReducer from '../features/subchapters/subchaptersSlice';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    subjects: subjectsReducer,
    chapters: chaptersReducer,
    subchapters: subchaptersReducer,
    tasks: tasksReducer,
  },
});
