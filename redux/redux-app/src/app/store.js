import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import educationReducer from '../features/education/educationSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    education: educationReducer,
  },
});
