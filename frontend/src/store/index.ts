import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer, { logoutUser } from './slices/authSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import { setOnUnauthorizedCallback } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaderboard: leaderboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Configure 401 interceptor to auto-logout
setOnUnauthorizedCallback(() => {
  store.dispatch(logoutUser());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
