import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './slices/employeeSlice';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import dashboardReducer from './slices/dashboardSlice';
import usersReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    auth: authReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
