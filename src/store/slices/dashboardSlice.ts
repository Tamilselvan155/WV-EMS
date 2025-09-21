import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardData, DashboardStats, DepartmentStats, RecentActivity } from '../../actions/dashboardActions';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.data = null;
      state.error = null;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Loading state
      .addCase('DASHBOARD_LOADING', (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Dashboard data loaded
      .addCase('DASHBOARD_LOADED', (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      
      // Error state
      .addCase('DASHBOARD_ERROR', (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
