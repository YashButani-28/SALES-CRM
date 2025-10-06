import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker, Input, InputNumber, Select, Checkbox, Radio, Upload, Spin, message } from 'antd';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import {
  fetchCustomFields,
  selectCustomFields,
  selectCustomFieldsTimestamp,
} from '../features/customFields/customFieldsSlice';
import type { CustomField } from '../api/customFieldsApi';
import { buildCustomFieldsSchema } from '../utils/validationJsonToYup';

const STALE_MS = 1000 * 60 * 5;

type Props = {
  entity: string;
  onRequestUploadUrl: (file: File) => Promise<{ url: string; key: string }>;
};

const DynamicCustomFields: React.FC<Props> = ({ entity, onRequestUploadUrl }) => {
  const dispatch = useAppDispatch();
  const fields = useAppSelector(selectCustomFields(entity));
  const lastFetchedAt = useAppSelector(selectCustomFieldsTimestamp(entity));
  const entityState = useAppSelector((state) => state.customFields.byEntity[entity]);
  const isLoading = !entityState;
  const { control, setValue, trigger, formState } = useFormContext();

  useEffect(() => {
    const shouldFetch = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_MS;
    if (shouldFetch) {
      dispatch(fetchCustomFields(entity));
    }
  }, [dispatch, entity, lastFetchedAt]);

  useEffect(() => {
    if (!fields.length) return;
    const schema = buildCustomFieldsSchema(fields);
    schema.validate({}, { abortEarly: false }).catch(() => undefined);
    // force revalidation when schema updates
    trigger();
  }, [fields, trigger]);

  if (isLoading && !fields.length) {
    return <Spin />;
  }

  if (!fields.length) {
    return null;
  }

  const renderField = (field: CustomField) => {
    const name = `customFields.${field.key}`;
    const label = field.label;
    const validation = (field.validation as Record<string, unknown> | null) ?? {};

    switch (field.fieldType) {
      case 'Number':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <InputNumber
                {...controllerField}
                style={{ width: '100%' }}
                min={validation.min as number | undefined}
                max={validation.max as number | undefined}
                status={fieldState.error ? 'error' : ''}
              />
            )}
          />
        );
      case 'Date':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <DatePicker
                {...controllerField}
                value={controllerField.value ? dayjs(controllerField.value) : null}
                onChange={(value) => controllerField.onChange(value ? value.toISOString() : null)}
                style={{ width: '100%' }}
                status={fieldState.error ? 'error' : ''}
              />
            )}
          />
        );
      case 'Dropdown':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Select
                {...controllerField}
                options={(validation.options as string[] | undefined)?.map((option) => ({
                  label: option,
                  value: option,
                }))}
                status={fieldState.error ? 'error' : ''}
              />
            )}
          />
        );
      case 'Radio':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Radio.Group {...controllerField} status={fieldState.error ? 'error' : ''}>
                {(validation.options as string[] | undefined)?.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        );
      case 'Checkbox':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField }) => (
              <Checkbox
                checked={Boolean(controllerField.value)}
                onChange={(event) => controllerField.onChange(event.target.checked)}
              >
                {label}
              </Checkbox>
            )}
          />
        );
      case 'FileUpload':
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => {
              const uploadProps: UploadProps = {
                beforeUpload: async (file) => {
                  try {
                    const { url, key } = await onRequestUploadUrl(file);
                    await fetch(url, {
                      method: 'PUT',
                      body: file,
                      headers: { 'Content-Type': file.type },
                    });
                    setValue(name, key, { shouldValidate: true });
                  } catch (error) {
                    message.error('Upload failed');
                  }
                  return false;
                },
                multiple: false,
                showUploadList: false,
              };
              return (
                <Upload {...uploadProps}>
                  <Input
                    readOnly
                    value={controllerField.value || ''}
                    status={fieldState.error ? 'error' : ''}
                    placeholder="Click to upload"
                  />
                </Upload>
              );
            }}
          />
        );
      default:
        return (
          <Controller
            key={field.id}
            name={name}
            control={control}
            render={({ field: controllerField, fieldState }) => (
              <Input {...controllerField} status={fieldState.error ? 'error' : ''} />
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          {field.fieldType !== 'Checkbox' && field.fieldType !== 'FileUpload' && (
            <label className="mb-1 block text-sm font-medium text-slate-600">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
          )}
          {renderField(field)}
          {formState.errors?.customFields?.[field.key] && (
            <div className="text-xs text-red-500">
              {String(formState.errors.customFields?.[field.key]?.message || '')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicCustomFields;
