import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { authAPI } from '../../actions/authActions';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      return {
        user,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    } catch (error) {
      // If parsing fails, clear localStorage and return initial state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      // Call logout API endpoint
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, clear local storage
      console.log('Logout API call failed, but clearing local storage');
    } finally {
      // Always clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkAuth();
      return response.data;
    } catch (error: any) {
      // If checkAuth fails, clear localStorage and reject
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue('Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // Even if logout fails, clear the state
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
