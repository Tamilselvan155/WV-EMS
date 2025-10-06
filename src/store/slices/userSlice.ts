import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { userAPI } from '../../actions/userActions';

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserState {
  users: UserItem[];
  loading: boolean;
  error: string | null;
  pagination: UserPagination;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  pagination: { currentPage: 1, totalPages: 1, totalUsers: 0, hasNext: false, hasPrev: false },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string; role?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: { firstName: string; lastName: string; email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: { firstName?: string; lastName?: string; email?: string; role?: string; password?: string } }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload?.users || action.payload?.data?.users || [];
        state.pagination = action.payload.pagination || action.payload?.data?.pagination || state.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.pagination.totalUsers += 1;
      })
      .addCase(createUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user';
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        state.pagination.totalUsers -= 1;
      })
      .addCase(deleteUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export default userSlice.reducer;


