import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../slices/userReducer';
import hotelReducer from '../slices/hotelReducer';

export const store = configureStore({
  reducer: {
    user: userReducer,
    hotel: hotelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

