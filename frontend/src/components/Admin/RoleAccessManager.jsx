import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, Checkbox, Empty, Table, Typography, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
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
  const { list: roles = [] } = useAppSelector((state) => state.roles || { list: [] });
  const { list: modules = [] } = useAppSelector((state) => state.modules || { list: [] });
  const { modulePermissionsByRole = {}, saveStatus } = useAppSelector((state) => state.roles || { modulePermissionsByRole: {}, saveStatus: 'idle' });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      roleId: null,
      assignments: [],
    },
  });

  const selectedRoleId = watch('roleId');

  useEffect(() => {
    dispatch(fetchRoles()).catch(err => {
      console.error("Failed to fetch roles:", err);
    });
    dispatch(fetchModules()).catch(err => {
      console.error("Failed to fetch modules:", err);
    });
  }, [dispatch]);

  useEffect(() => {
    if (selectedRoleId) {
      dispatch(fetchRoleModulePermissions(selectedRoleId)).catch(err => {
        console.error("Failed to fetch role module permissions:", err);
      });
    }
  }, [dispatch, selectedRoleId]);

  useEffect(() => {
    if (selectedRoleId && modulePermissionsByRole[selectedRoleId]) {
      const permissions = modulePermissionsByRole[selectedRoleId];
      const moduleMap = new Map(permissions.map((p) => [p.module, p.actions]));

      const assignments = modules.map((module) => ({
        module: module.key,
        actions: moduleMap.get(module.key) || [],
      }));

      setValue('assignments', assignments);
    } else if (modules.length > 0) {
      setValue(
        'assignments',
        modules.map((module) => ({ module: module.key, actions: [] }))
      );
    }
  }, [setValue, selectedRoleId, modulePermissionsByRole, modules]);

  const tableData = useMemo(() => {
    const assignments = watch('assignments') || [];
    return assignments.map((assignment, index) => ({
      key: assignment.module,
      module: modules.find((m) => m.key === assignment.module)?.name || assignment.module,
      actions: assignment.actions || [],
      index,
    }));
  }, [watch, modules]);

  const columns = [
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    ...DEFAULT_ACTION_ORDER.map((action) => ({
      title: ACTION_LABELS[action],
      key: action,
      render: (_, record) => (
        <Controller
          name={`assignments.${record.index}.actions`}
          control={control}
          render={({ field }) => (
            <Checkbox
              checked={field.value?.includes(action)}
              onChange={(e) => {
                const checked = e.target.checked;
                const currentActions = [...(field.value || [])];
                if (checked && !currentActions.includes(action)) {
                  field.onChange([...currentActions, action]);
                } else if (!checked && currentActions.includes(action)) {
                  field.onChange(currentActions.filter((a) => a !== action));
                }
              }}
            />
          )}
        />
      ),
    })),
  ];

  const onSubmit = async (data) => {
    if (!data.roleId) return;
    
    try {
      await dispatch(
        saveRoleModulePermissions({
          roleId: data.roleId,
          permissions: data.assignments,
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to save role module permissions:", error);
    }
  };

  return (
    <Card title="Module Access Control" className="w-full rounded-2xl border border-slate-200 shadow-card">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Select Role</label>
          <Controller
            name="roleId"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                {...field}
                size="large"
                placeholder="Select a role to manage permissions"
                options={roles.map((role) => ({ label: role.name, value: role.id }))}
                status={fieldState.error ? 'error' : ''}
              />
            )}
          />
          {errors.roleId && <div className="text-xs text-red-500">{errors.roleId.message}</div>}
        </div>

        <div className="flex flex-col gap-2">
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