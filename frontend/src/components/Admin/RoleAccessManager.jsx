import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, Checkbox, Empty, Table, Typography, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks.js';
import { fetchRoles, fetchRoleModulePermissions, saveRoleModulePermissions } from '../../features/roles/rolesSlice.js';
import { fetchModules } from '../../features/modules/modulesSlice.js';
import * as yup from 'yup';

const ACTION_LABELS = {
  read: 'Read',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
};

const DEFAULT_ACTION_ORDER = ['read', 'create', 'update', 'delete'];

const schema = yup.object({
  roleId: yup.number().typeError('Select a role').required('Select a role'),
  assignments: yup
    .array()
    .of(
      yup.object({
        module: yup.string().required(),
        actions: yup.array().of(yup.string()),
      })
    )
    .required(),
});

const RoleAccessManager = () => {
  const dispatch = useAppDispatch();
  const { list: roles, modulePermissionsByRole, saveStatus } = useAppSelector((state) => state.roles);
  const { list: modules, actions: moduleActions } = useAppSelector((state) => state.modules);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      roleId: undefined,
      assignments: [],
    },
  });

  const selectedRoleId = watch('roleId');

  useEffect(() => {
    if (!roles.length) {
      dispatch(fetchRoles());
    }
    if (!modules.length) {
      dispatch(fetchModules());
    }
  }, [dispatch, roles.length, modules.length]);

  useEffect(() => {
    if (modules.length) {
      setValue(
        'assignments',
        modules.map((module) => ({ module: module.key, actions: [] })),
        { shouldDirty: false }
      );
    }
  }, [modules, setValue]);

  useEffect(() => {
    if (selectedRoleId) {
      dispatch(fetchRoleModulePermissions(selectedRoleId));
    }
  }, [dispatch, selectedRoleId]);

  useEffect(() => {
    if (!selectedRoleId || !modules.length) {
      return;
    }

    const saved = modulePermissionsByRole[selectedRoleId] || [];
    const nextAssignments = modules.map((module) => {
      const existing = saved.find((permission) => permission.module === module.key);
      return {
        module: module.key,
        actions: existing?.actions || [],
      };
    });

    setValue('assignments', nextAssignments, { shouldDirty: false });
  }, [selectedRoleId, modulePermissionsByRole, modules, setValue]);

  const tableData = useMemo(
    () =>
      modules.map((module, index) => ({
        key: module.key,
        index,
        moduleKey: module.key,
        title: module.name,
        description: module.description,
      })),
    [modules]
  );

  const columns = useMemo(() => {
    const actionKeys = moduleActions.length ? moduleActions : DEFAULT_ACTION_ORDER;

    return [
      {
        title: 'Module',
        dataIndex: 'title',
        key: 'module',
        render: (text, record) => (
          <div>
            <Controller
              name={`assignments.${record.index}.module`}
              control={control}
              render={({ field }) => <input type="hidden" {...field} value={record.moduleKey} />}
            />
            <Typography.Text strong>{text}</Typography.Text>
            <Typography.Paragraph className="!mb-0 text-xs text-slate-500">
              {record.description}
            </Typography.Paragraph>
          </div>
        ),
      },
      ...actionKeys.map((action) => ({
        title: ACTION_LABELS[action] || action,
        dataIndex: action,
        key: `${action}-column`,
        align: 'center',
        render: (_text, record) => (
          <Controller
            name={`assignments.${record.index}.actions`}
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value?.includes(action)}
                disabled={!selectedRoleId}
                onChange={(event) => {
                  const checked = event.target.checked;
                  const current = new Set(field.value || []);
                  if (checked) {
                    current.add(action);
                  } else {
                    current.delete(action);
                  }
                  field.onChange(Array.from(current));
                }}
              />
            )}
          />
        ),
      })),
    ];
  }, [control, moduleActions, selectedRoleId]);

  const onSubmit = async (values) => {
    const payload = {
      roleId: values.roleId,
      permissions: values.assignments,
    };
    try {
      await dispatch(saveRoleModulePermissions(payload)).unwrap();
    } catch (error) {
      // notifications handled in slice
    }
  };

  return (
    <Card className="w-full rounded-2xl border border-slate-200 shadow-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[220px]">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select a role"
                    options={roles.map((role) => ({ label: role.name, value: role.id }))}
                  />
                )}
              />
              {errors.roleId && <p className="mt-1 text-sm text-rose-500">{errors.roleId.message}</p>}
            </div>
          </div>
          <Alert
            type="info"
            showIcon
            message="Grant module-level privileges. Enable Read to make a module visible in the sidebar and dashboard."
          />
        </div>

        {modules.length === 0 ? (
          <Empty description="No modules configured" />
        ) : (
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            bordered
            className="overflow-hidden rounded-xl border border-slate-200"
            scroll={{ x: true }}
          />
        )}

        <div className="flex justify-end">
          <Button type="primary" htmlType="submit" disabled={!selectedRoleId} loading={saveStatus === 'loading'}>
            Save Permissions
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoleAccessManager;
