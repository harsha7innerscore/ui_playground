import { configureStore } from '@reduxjs/toolkit';
import educationReducer from '../features/education/educationSlice';

export const store = configureStore({
  reducer: {
    education: educationReducer,
  },
});
