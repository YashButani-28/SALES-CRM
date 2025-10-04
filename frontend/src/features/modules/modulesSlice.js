import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import client from '../../api/client.js';

const initialState = {
  list: [],
  actions: [],
  status: 'idle',
  error: null,
};

export const fetchModules = createAsyncThunk('modules/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/modules');
    return data;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to load modules');
  }
});

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.modules || [];
        state.actions = action.payload.actions || [];
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default modulesSlice.reducer;
