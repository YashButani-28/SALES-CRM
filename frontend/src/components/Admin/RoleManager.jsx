import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, Col, Input, Row, Select, Space, Table, Typography } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { createRole, fetchRoles } from '../../features/roles/rolesSlice.js';
import { fetchPermissions } from '../../features/permissions/permissionsSlice.js';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().nullable(),
  permissionIds: yup.array().of(yup.number()).min(1, 'Select at least one permission'),
});

const RoleManager = () => {
  const dispatch = useAppDispatch();
  const { list: permissions } = useAppSelector((state) => state.permissions);
  const { list: roles } = useAppSelector((state) => state.roles);

  useEffect(() => {
    if (!permissions.length) dispatch(fetchPermissions());
    if (!roles.length) dispatch(fetchRoles());
  }, [dispatch, permissions.length, roles.length]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', permissionIds: [] },
  });

  const onSubmit = async (values) => {
    await dispatch(createRole(values)).unwrap();
    reset({ name: '', description: '', permissionIds: [] });
  };

  const columns = [
    { title: 'Role', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (value) =>
        Array.isArray(value) && value.length
          ? value.map((item) => item.name).join(', ')
          : '—',
    },
  ];

  return (
    <Card title="Roles" className="w-full rounded-2xl border border-slate-200 shadow-card">
      <Space direction="vertical" size="large" className="w-full">
        <Typography.Paragraph className="!mb-0 text-sm text-slate-500">
          Bundle feature-level permissions into reusable access templates for your team.
        </Typography.Paragraph>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <label className="text-sm font-medium text-slate-700">Role name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Sales Manager" size="large" />}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Oversees account executives" size="large" />}
              />
            </Col>
            <Col span={24}>
              <label className="text-sm font-medium text-slate-700">Assign permissions</label>
              <Controller
                name="permissionIds"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    mode="multiple"
                    className="w-full"
                    allowClear
                    size="large"
                    placeholder="Select permissions"
                    optionFilterProp="label"
                    options={permissions.map((permission) => ({
                      label: permission.name,
                      value: permission.id,
                    }))}
                  />
                )}
              />
              {errors.permissionIds && (
                <p className="mt-1 text-sm text-rose-500">{errors.permissionIds.message}</p>
              )}
            </Col>
          </Row>
          <div className="mt-6 flex justify-end">
            <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
              Create Role
            </Button>
          </div>
        </form>

        <Table
          className="mt-4"
          rowKey="id"
          dataSource={roles}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
      </Space>
    </Card>
  );
};

export default RoleManager;
