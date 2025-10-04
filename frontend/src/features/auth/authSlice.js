import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import toast from 'react-hot-toast';
import client, { setAuthToken } from '../../api/client.js';

const initialState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/auth/login', { email, password });
    return data;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to login');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/users/me');
    return data.user;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to load profile');
  }
});

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/auth/change-password', { currentPassword, newPassword });
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to change password');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/auth/forgot-password', { email, newPassword });
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to reset password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      setAuthToken(null);
    },
    hydrateToken: (state, action) => {
      state.token = action.payload;
      if (state.token) {
        setAuthToken(state.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.user.modulePermissions = action.payload.user?.modulePermissions || [];
        setAuthToken(action.payload.token);
        toast.success('Login successful');
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = {
          ...action.payload,
          modulePermissions: action.payload?.modulePermissions || [],
        };
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        message.success(action.payload.message || 'Password updated');
      })
      .addCase(changePassword.rejected, (state, action) => {
        message.error(action.payload || 'Unable to change password');
      })
      .addCase(resetPassword.fulfilled, (_, action) => {
        toast.success(action.payload.message || 'Password reset successful');
      })
      .addCase(resetPassword.rejected, (_, action) => {
        toast.error(action.payload || 'Unable to reset password');
      });
  },
});

export const { logout, hydrateToken } = authSlice.actions;

export default authSlice.reducer;
