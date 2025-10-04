import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';
import toast from 'react-hot-toast';
import client from '../../api/client.js';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
  modulePermissionsByRole: {},
  modulePermissionsStatus: 'idle',
  modulePermissionsError: null,
  saveStatus: 'idle',
};

export const fetchRoles = createAsyncThunk('roles/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await client.get('/roles');
    return data.roles || [];
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to fetch roles');
  }
});

export const createRole = createAsyncThunk(
  'roles/create',
  async ({ name, description, permissionIds }, { rejectWithValue }) => {
    try {
      const { data } = await client.post('/roles', { name, description, permissionIds });
      return data.role;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create role');
    }
  }
);

export const fetchRoleModulePermissions = createAsyncThunk(
  'roles/fetchModulePermissions',
  async (roleId, { rejectWithValue }) => {
    try {
      const { data } = await client.get(`/roles/${roleId}/module-permissions`);
      return { roleId, permissions: data.permissions || [] };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch module permissions');
    }
  }
);

export const saveRoleModulePermissions = createAsyncThunk(
  'roles/saveModulePermissions',
  async ({ roleId, permissions }, { rejectWithValue }) => {
    try {
      const { data } = await client.put(`/roles/${roleId}/module-permissions`, { permissions });
      return { roleId, permissions: data.permissions || [] };
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to save module permissions');
    }
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        const map = {};
        action.payload.forEach((role) => {
          if (Array.isArray(role.modulePermissions)) {
            map[role.id] = role.modulePermissions;
          }
        });
        state.modulePermissionsByRole = {
          ...state.modulePermissionsByRole,
          ...map,
        };
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.list = [...state.list, action.payload];
        state.modulePermissionsByRole[action.payload.id] = [];
        toast.success('Role created successfully');
      })
      .addCase(createRole.rejected, (_, action) => {
        message.error(action.payload || 'Unable to create role');
      })
      .addCase(fetchRoleModulePermissions.pending, (state) => {
        state.modulePermissionsStatus = 'loading';
        state.modulePermissionsError = null;
      })
      .addCase(fetchRoleModulePermissions.fulfilled, (state, action) => {
        state.modulePermissionsStatus = 'succeeded';
        state.modulePermissionsByRole[action.payload.roleId] = action.payload.permissions;
      })
      .addCase(fetchRoleModulePermissions.rejected, (state, action) => {
        state.modulePermissionsStatus = 'failed';
        state.modulePermissionsError = action.payload;
      })
      .addCase(saveRoleModulePermissions.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveRoleModulePermissions.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.modulePermissionsByRole[action.payload.roleId] = action.payload.permissions;
        toast.success('Permissions updated successfully');
      })
      .addCase(saveRoleModulePermissions.rejected, (state, action) => {
        state.saveStatus = 'failed';
        message.error(action.payload || 'Unable to save permissions');
      });
  },
});

export default rolesSlice.reducer;
