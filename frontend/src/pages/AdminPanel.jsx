import { Tabs } from 'antd';
import { FiKey, FiLayers, FiUserPlus } from 'react-icons/fi';
import RoleAccessManager from '../components/admin/RoleAccessManager.jsx';
import RoleManager from '../components/admin/RoleManager.jsx';
import UserManager from '../components/admin/UserManager.jsx';
import { useAppSelector } from '../hooks/storeHooks';

const AdminPanel = () => {
  const { user } = useAppSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase();
  const isSuperAdmin = roleName === 'super admin' || user?.email === 'admin@example.com';
  const canManagePermissions = isSuperAdmin || user?.permissions?.includes('manage_permissions');
  const canManageRoles = isSuperAdmin || user?.permissions?.includes('manage_roles');
  const canManageUsers = isSuperAdmin || user?.permissions?.includes('manage_users');

  const tabs = [];

  if (canManagePermissions) {
    tabs.push({
      key: 'permissions',
      label: (
        <span className="flex items-center gap-2">
          <FiKey /> Permissions
        </span>
      ),
      children: <RoleAccessManager />,
    });
  }

  if (canManageRoles) {
    tabs.push({
      key: 'roles',
      label: (
        <span className="flex items-center gap-2">
          <FiLayers /> Roles
        </span>
      ),
      children: <RoleManager />,
    });
  }

  if (canManageUsers) {
    tabs.push({
      key: 'users',
      label: (
        <span className="flex items-center gap-2">
          <FiUserPlus /> Users
        </span>
      ),
      children: <UserManager />,
    });
  }

  if (tabs.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="card-surface text-center">
          <h2 className="text-xl font-semibold text-slate-900">Limited Access</h2>
          <p className="mt-2 text-sm text-slate-500">
            You do not have the required permissions to manage admin resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 md:px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-2 md:p-4 shadow-card">
        <Tabs defaultActiveKey={tabs[0].key} size="large" items={tabs} className="user-management-tabs" />
      </div>
    </div>
  );
};

export default AdminPanel;
