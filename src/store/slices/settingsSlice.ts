import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings, CompanySettings, UserManagementSettings, SystemSettings, NotificationSettings, SecuritySettings, BackupSettings } from '../../actions/settingsActions';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSettings: (state) => {
      state.settings = null;
      state.error = null;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Loading state
      .addCase('SETTINGS_LOADING', (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Settings loaded
      .addCase('SETTINGS_LOADED', (state, action: PayloadAction<Settings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      
      // Settings updated
      .addCase('SETTINGS_UPDATED', (state, action: PayloadAction<{ section: string; data: any }>) => {
        state.loading = false;
        if (state.settings) {
          const { section, data } = action.payload;
          (state.settings as any)[section] = data;
        }
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      
      // Settings reset
      .addCase('SETTINGS_RESET', (state, action: PayloadAction<Settings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      
      // Error state
      .addCase('SETTINGS_ERROR', (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
