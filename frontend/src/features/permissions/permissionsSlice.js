import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import toast from 'react-hot-toast';
import client from '../../api/client.js';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await client.get('/permissions');
      return data.permissions || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch permissions');
    }
  }
);

export const createPermission = createAsyncThunk(
  'permissions/create',
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/permissions', { name, description });
      return data.permission;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create permission');
    }
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.list = [...state.list, action.payload];
        toast.success('Permission created successfully');
      })
      .addCase(createPermission.rejected, (_, action) => {
        message.error(action.payload || 'Unable to create permission');
      });
  },
});

export default permissionsSlice.reducer;
