import client from './client.js';

export interface CustomField {
  id: string;
  entity: string;
  fieldType: string;
  label: string;
  key: string;
  required: boolean;
  validation?: Record<string, unknown> | null;
  defaultValue?: string | null;
  order: number;
  group?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomFieldPayload = {
  entity: string;
  fieldType: string;
  label: string;
  key: string;
  required: boolean;
  validation?: Record<string, unknown> | null;
  defaultValue?: string | null;
  order?: number;
  group?: string | null;
};

export type UpdateCustomFieldPayload = Partial<CreateCustomFieldPayload>;

export type ReorderPayload = Array<{ id: string; order: number; group?: string | null }>;

const basePath = '/custom-fields';

export const fetchCustomFieldsApi = async (entity: string) => {
  const response = await client.get<{ success: boolean; data: CustomField[] }>(
    `${basePath}?entity=${encodeURIComponent(entity)}`
  );
  return response.data.data;
};

export const addCustomFieldApi = async (payload: CreateCustomFieldPayload) => {
  try {
    const response = await client.post<{ success: boolean; data: CustomField }>(
      basePath,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating custom field:', error.response?.data || error);
    throw error;
  }
};

export const updateCustomFieldApi = async (id: string, payload: UpdateCustomFieldPayload) => {
  const response = await client.put<{ success: boolean; data: CustomField }>(
    `${basePath}/${id}`,
    payload
  );
  return response.data.data;
};

export const deleteCustomFieldApi = async (id: string) => {
  const response = await client.delete<{ success: boolean; data: boolean }>(`${basePath}/${id}`);
  return response.data.data;
};

export const reorderCustomFieldsApi = async (payload: ReorderPayload) => {
  const response = await client.post<{ success: boolean; data: boolean }>(
    `${basePath}/reorder`,
    { fields: payload }
  );
  return response.data.data;
};