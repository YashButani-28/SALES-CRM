import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import {
  CustomField,
  CreateCustomFieldPayload,
  UpdateCustomFieldPayload,
  ReorderPayload,
  fetchCustomFieldsApi,
  addCustomFieldApi,
  updateCustomFieldApi,
  deleteCustomFieldApi,
  reorderCustomFieldsApi,
} from '../../api/customFieldsApi';

export interface CustomFieldEntityState {
  fields: CustomField[];
  lastFetchedAt: number;
}

export interface CustomFieldsState {
  byEntity: Record<string, CustomFieldEntityState>;
}

const initialState: CustomFieldsState = {
  byEntity: {},
};

export const fetchCustomFields = createAsyncThunk<CustomField[], string>(
  'customFields/fetchCustomFields',
  async (entity) => {
    return fetchCustomFieldsApi(entity);
  }
);

export const addField = createAsyncThunk<CustomField, CreateCustomFieldPayload>(
  'customFields/addField',
  async (payload) => {
    return addCustomFieldApi(payload);
  }
);

export const updateField = createAsyncThunk<CustomField, { id: string; data: UpdateCustomFieldPayload }>(
  'customFields/updateField',
  async ({ id, data }) => {
    return updateCustomFieldApi(id, data);
  }
);

export const deleteField = createAsyncThunk<{ id: string; entity: string }, { id: string; entity: string }>(
  'customFields/deleteField',
  async ({ id, entity }) => {
    await deleteCustomFieldApi(id);
    return { id, entity };
  }
);

export const reorderFields = createAsyncThunk<
  { entity: string; updated: ReorderPayload },
  { entity: string; updates: ReorderPayload }
>('customFields/reorderFields', async ({ entity, updates }) => {
  await reorderCustomFieldsApi(updates);
  return { entity, updated: updates };
});

const customFieldsSlice = createSlice({
  name: 'customFields',
  initialState,
  reducers: {
    clearCache: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        delete state.byEntity[action.payload];
      } else {
        state.byEntity = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomFields.fulfilled, (state, action) => {
        const entity = action.meta.arg;
        state.byEntity[entity] = {
          fields: action.payload,
          lastFetchedAt: Date.now(),
        };
      })
      .addCase(addField.fulfilled, (state, action) => {
        const entity = action.payload.entity;
        const existing = state.byEntity[entity];
        if (existing) {
          existing.fields.push(action.payload);
          existing.lastFetchedAt = Date.now();
        } else {
          state.byEntity[entity] = {
            fields: [action.payload],
            lastFetchedAt: Date.now(),
          };
        }
      })
      .addCase(updateField.fulfilled, (state, action) => {
        const entity = action.payload.entity;
        const existing = state.byEntity[entity];
        if (!existing) return;
        existing.fields = existing.fields.map((field) =>
          field.id === action.payload.id ? action.payload : field
        );
        existing.lastFetchedAt = Date.now();
      })
      .addCase(deleteField.fulfilled, (state, action) => {
        const entity = action.payload.entity;
        const existing = state.byEntity[entity];
        if (!existing) return;
        existing.fields = existing.fields.filter((field) => field.id !== action.payload.id);
        existing.lastFetchedAt = Date.now();
      })
      .addCase(reorderFields.fulfilled, (state, action) => {
        const { entity, updated } = action.payload;
        const existing = state.byEntity[entity];
        if (!existing) return;
        const orderMap = new Map(updated.map((item) => [item.id, item]));
        existing.fields = existing.fields.map((field) => {
          const update = orderMap.get(field.id);
          return update
            ? {
                ...field,
                order: update.order,
                group: typeof update.group === 'undefined' ? field.group ?? null : update.group ?? null,
              }
            : field;
        });
        existing.fields.sort((a, b) => (a.group || '').localeCompare(b.group || '') || a.order - b.order);
        existing.lastFetchedAt = Date.now();
      });
  },
});

export const { clearCache } = customFieldsSlice.actions;

export const selectCustomFields = (entity: string) => (state: RootState) =>
  state.customFields.byEntity[entity]?.fields ?? [];

export const selectCustomFieldsTimestamp = (entity: string) => (state: RootState) =>
  state.customFields.byEntity[entity]?.lastFetchedAt ?? 0;

export default customFieldsSlice.reducer;
