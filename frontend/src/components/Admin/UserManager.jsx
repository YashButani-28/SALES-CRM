import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, Col, Input, Row, Select, Space, Table, Typography } from 'antd';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks.js';
import { createUserAccount } from '../../features/users/usersSlice.js';
import { fetchRoles } from '../../features/roles/rolesSlice.js';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  roleId: yup.number().nullable(),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
});

const UserManager = () => {
  const dispatch = useAppDispatch();
  const { list: roles } = useAppSelector((state) => state.roles);
  const { created } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (!roles.length) dispatch(fetchRoles());
  }, [dispatch, roles.length]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: null,
      status: 'active',
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
      roleId: values.roleId || undefined,
      status: values.status,
    };
    await dispatch(createUserAccount(payload)).unwrap();
    reset({ name: '', email: '', password: '', roleId: null, status: 'active' });
  };

  const roleNameById = new Map(roles.map((role) => [role.id, role.name]));

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => roleNameById.get(record.role_id) || '—',
    },
  ];

  return (
    <Card title="Users" className="w-full rounded-2xl border border-slate-200 shadow-card">
      <Space direction="vertical" size="large" className="w-full">
        <Typography.Paragraph className="!mb-0 text-sm text-slate-500">
          Provision new teammates, assign roles, and keep your CRM accounts organized.
        </Typography.Paragraph>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Jane Cooper" size="large" />}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input {...field} placeholder="jane@example.com" size="large" />}
              />
              {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
            </Col>
            <Col xs={24} md={12}>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input.Password {...field} placeholder="Secure password" size="large" />}
              />
              {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
            </Col>
            <Col xs={24} md={6}>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    placeholder="Assign a role"
                    size="large"
                    options={roles.map((role) => ({ label: role.name, value: role.id }))}
                  />
                )}
              />
            </Col>
            <Col xs={24} md={6}>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                    ]}
                  />
                )}
              />
              {errors.status && <p className="mt-1 text-sm text-rose-500">{errors.status.message}</p>}
            </Col>
          </Row>
          <div className="mt-6 flex justify-end">
            <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>

        <Table
          className="mt-4"
          rowKey="id"
          dataSource={created}
          columns={columns}
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: 'Users you create will appear here.' }}
        />
      </Space>
    </Card>
  );
};

export default UserManager;
