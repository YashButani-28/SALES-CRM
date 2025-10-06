import { useEffect } from 'react';
import { Modal, Form, Select, Input, Switch, InputNumber, Divider } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CustomField, CreateCustomFieldPayload } from '../../api/customFieldsApi';

const FIELD_TYPE_OPTIONS = [
  { label: 'Text', value: 'Text' },
  { label: 'Number', value: 'Number' },
  { label: 'Date', value: 'Date' },
  { label: 'Dropdown', value: 'Dropdown' },
  { label: 'Checkbox', value: 'Checkbox' },
  { label: 'Radio', value: 'Radio' },
  { label: 'File Upload', value: 'FileUpload' },
];

const validationSchema = yup.object({
  fieldType: yup.string().required('Field type is required'),
  label: yup.string().required('Label is required'),
  key: yup
    .string()
    .matches(/^[A-Za-z0-9_]+$/, 'Key must be alphanumeric with underscores')
    .required('Key is required'),
  required: yup.boolean().required(),
  defaultValue: yup.string().nullable(),
  validation: yup.object().shape({
    maxLength: yup.number().optional(),
    regex: yup.string().optional(),
    min: yup.number().optional(),
    max: yup.number().optional(),
    options: yup.array(yup.string()).optional(),
  }),
  group: yup.string().nullable(),
});

export type CustomFieldFormValues = Pick<
  CreateCustomFieldPayload,
  'fieldType' | 'label' | 'key' | 'required' | 'defaultValue' | 'validation' | 'group'
> & { options?: string };

type Props = {
  open: boolean;
  entity: string;
  initialValues?: CustomField | null;
  onSubmit: (values: CreateCustomFieldPayload) => Promise<void>;
  onCancel: () => void;
  confirmLoading?: boolean;
};

const CustomFieldModal = ({ open, entity, initialValues, onSubmit, onCancel, confirmLoading }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<CustomFieldFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      fieldType: 'Text',
      label: '',
      key: '',
      required: true,
      defaultValue: '',
      validation: {},
      group: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          fieldType: initialValues.fieldType,
          label: initialValues.label,
          key: initialValues.key,
          required: initialValues.required,
          defaultValue: initialValues.defaultValue ?? '',
          validation: (initialValues.validation as Record<string, unknown> | null) ?? {},
          group: initialValues.group ?? '',
        });
      } else {
        reset({
          fieldType: 'Text',
          label: '',
          key: '',
          required: true,
          defaultValue: '',
          validation: {},
          group: '',
        });
      }
    }
  }, [open, initialValues, reset]);

  const selectedType = watch('fieldType');

  const submitHandler = handleSubmit(async (values) => {
    // Clean up validation object
    const validation = { ...values.validation };
    
    // Remove empty strings from validation
    Object.keys(validation).forEach(key => {
      if (validation[key] === '') {
        delete validation[key];
      }
    });
    
    const payload: CreateCustomFieldPayload = {
      entity,
      fieldType: values.fieldType,
      label: values.label,
      key: values.key,
      required: values.required,
      defaultValue: values.defaultValue || '',
      validation: Object.keys(validation).length > 0 ? validation : undefined,
      group: values.group || undefined,
    };

    await onSubmit(payload);
  });

  return (
    <Modal
      open={open}
      title={initialValues ? 'Edit Custom Field' : 'Add Custom Field'}
      onCancel={onCancel}
      onOk={submitHandler}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item label="Field Type" required>
          <Controller
            name="fieldType"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Select {...field} options={FIELD_TYPE_OPTIONS} status={fieldState.error ? 'error' : ''} />
                {fieldState.error && <div className="text-red-500 text-xs">{fieldState.error.message}</div>}
              </>
            )}
          />
        </Form.Item>

        <Form.Item label="Label" required>
          <Controller
            name="label"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} status={fieldState.error ? 'error' : ''} />
                {fieldState.error && <div className="text-red-500 text-xs">{fieldState.error.message}</div>}
              </>
            )}
          />
        </Form.Item>

        <Form.Item label="Key" required extra="Unique identifier used in APIs">
          <Controller
            name="key"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} disabled={Boolean(initialValues)} status={fieldState.error ? 'error' : ''} />
                {fieldState.error && <div className="text-red-500 text-xs">{fieldState.error.message}</div>}
              </>
            )}
          />
        </Form.Item>

        <Form.Item label="Required">
          <Controller
            name="required"
            control={control}
            render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
          />
        </Form.Item>

        <Form.Item label="Default Value">
          <Controller
            name="defaultValue"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>

        <Form.Item label="Group / Section">
          <Controller
            name="group"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Optional section label" />}
          />
        </Form.Item>

        <Divider>Validation</Divider>

        {selectedType === 'Text' && (
          <>
            <Form.Item label="Max Length">
              <Controller
                name="validation.maxLength"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} min={1} />
                )}
              />
            </Form.Item>
            <Form.Item label="Regex Pattern">
              <Controller
                name="validation.regex"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </>
        )}

        {selectedType === 'Number' && (
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Min">
              <Controller
                name="validation.min"
                control={control}
                render={({ field }) => <InputNumber {...field} style={{ width: '100%' }} />}
              />
            </Form.Item>
            <Form.Item label="Max">
              <Controller
                name="validation.max"
                control={control}
                render={({ field }) => <InputNumber {...field} style={{ width: '100%' }} />}
              />
            </Form.Item>
          </div>
        )}

        {selectedType === 'Dropdown' && (
          <Form.Item label="Options (comma separated)">
            <Controller
              name="validation.options"
              control={control}
              render={({ field }) => (
                <Input
                  value={Array.isArray(field.value) ? field.value.join(',') : field.value as any}
                  onChange={(e) => field.onChange(e.target.value.split(',').map((v) => v.trim()).filter(Boolean))}
                />
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CustomFieldModal;