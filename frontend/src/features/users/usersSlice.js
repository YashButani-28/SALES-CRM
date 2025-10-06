import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import toast from 'react-hot-toast';
import client from '../../api/client.js';

const initialState = {
  created: [],
  status: 'idle',
  error: null,
};

export const createUserAccount = createAsyncThunk(
  'users/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/users', payload);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersState: (state) => {
      state.created = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUserAccount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUserAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.created = [...state.created, action.payload];
        toast.success('User created successfully');
      })
      .addCase(createUserAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        message.error(action.payload || 'Unable to create user');
      });
  },
});

export const { clearUsersState } = usersSlice.actions;

export default usersSlice.reducer;
