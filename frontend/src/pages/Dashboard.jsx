import { Card, Tag } from 'antd';
import { useMemo } from 'react';
import { useAppSelector } from '../hooks/storeHooks.js';

const modules = [
  {
    key: 'dashboard-overview',
    moduleKey: 'dashboard',
    name: 'My Profile',
    description: 'View and update your profile information.',
    permission: null,
    actions: ['Update password', 'Manage contact details'],
  },
  {
    key: 'user-management',
    moduleKey: 'user_management',
    name: 'User Management',
    description: 'Create, update, and deactivate platform users.',
    permission: 'manage_users',
    actions: ['Create new users', 'Assign roles', 'Deactivate accounts'],
  },
  {
    key: 'role-management',
    moduleKey: 'user_management',
    name: 'Role Management',
    description: 'Define new roles and adjust their permissions.',
    permission: 'manage_roles',
    actions: ['Create roles', 'Update role permissions'],
  },
  {
    key: 'permission-management',
    moduleKey: 'user_management',
    name: 'Permission Registry',
    description: 'Configure per-module visibility using role access controls.',
    permission: 'manage_permissions',
    actions: ['Create permissions', 'Review permission usage'],
  },
];

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = useMemo(() => {
    const roleName = user?.role?.name?.toLowerCase();
    return roleName === 'super admin' || user?.email === 'admin@example.com';
  }, [user]);

  const moduleAccess = useMemo(() => {
    const map = new Map();
    (user?.modulePermissions || []).forEach((permission) => {
      map.set(permission.module, new Set(permission.actions || []));
    });
    return map;
  }, [user]);

  const visibleModules = useMemo(() => {
    return modules.filter((module) => {
      const hasLegacyPermission = !module.permission || user?.permissions?.includes(module.permission);
      if (isSuperAdmin) {
        return true;
      }
      const actions = moduleAccess.get(module.moduleKey);
      const hasModuleAccess = actions ? actions.has('read') : false;
      return hasLegacyPermission || hasModuleAccess;
    });
  }, [moduleAccess, user, isSuperAdmin]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Card className="mb-8 rounded-2xl shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Welcome back, {user?.name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Your role: <span className="font-medium text-slate-700">{user?.role?.name ?? 'No role assigned'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user?.permissions?.length ? (
              user.permissions.map((permission) => (
                <Tag key={permission} color="purple">
                  {permission}
                </Tag>
              ))
            ) : (
              <Tag color="default">No permissions</Tag>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {visibleModules.map((module) => (
          <Card key={module.key} className="rounded-2xl shadow-card">
            <h3 className="text-lg font-semibold text-slate-900">{module.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{module.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {module.actions.map((action) => (
                <li key={action} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  {action}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
