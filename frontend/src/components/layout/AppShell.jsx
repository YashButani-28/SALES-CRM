import { FiHome, FiUsers, FiUser, FiSettings } from 'react-icons/fi';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { logout } from '../../features/auth/authSlice.js';

const { Header, Sider, Content } = Layout;

const AppShell = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
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

  const canViewModule = (moduleKey) => {
    if (!moduleKey) return true;
    if (isSuperAdmin) return true;
    const actions = moduleAccess.get(moduleKey);
    return actions ? actions.has('read') : false;
  };

  const menuItems = useMemo(() => {
    const base = [
      { key: 'dashboard', icon: <FiHome />, label: 'Dashboard', path: '/', module: 'dashboard' },
      { key: 'user-management', icon: <FiUsers />, label: 'User Management', path: '/admin', module: 'user_management' },
    ];
    if (user?.role === 'Admin' || isSuperAdmin) {
      base.push({ key: 'settings', icon: <FiSettings />, label: 'Settings', path: '/settings/custom-fields', module: null });
    }
    return base;
  }, [user, isSuperAdmin]);

  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => canViewModule(item.module)),
    [menuItems, moduleAccess, isSuperAdmin]
  );

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/admin')) return 'user-management';
    return 'dashboard';
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!visibleMenuItems.length) {
      return;
    }
    const hasAccess = visibleMenuItems.some((item) => item.key === selectedKey);
    if (!hasAccess) {
      navigate(visibleMenuItems[0].path, { replace: true });
    }
  }, [navigate, selectedKey, visibleMenuItems]);

  const headerTitle = useMemo(() => {
    if (location.pathname.startsWith('/settings')) {
      return 'Settings';
    }
    if (location.pathname.startsWith('/admin')) {
      return 'User Management';
    }
    if (location.pathname.startsWith('/profile')) {
      return 'Profile';
    }
    return 'Dashboard';
  }, [location.pathname]);
  return (
    <Layout className="min-h-screen bg-slate-100">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="bg-slate-900"
      >
        <div className="flex items-center gap-2 px-6 py-5 text-white">
          <div className="text-lg font-bold">Sales CRM</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={(info) => {
            const item = visibleMenuItems.find((menu) => menu.key === info.key);
            if (item) {
              navigate(item.path);
            }
          }}
          items={visibleMenuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          className="bg-slate-900"
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between bg-white px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              className="lg:hidden"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <Typography.Title level={4} className="!mb-0 text-slate-800">
              {headerTitle}
            </Typography.Title>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="text"
              className="flex items-center gap-2 text-slate-600"
              onClick={() => navigate('/profile')}
            >
              <FiUser className="text-lg" />
              <span className="font-medium text-slate-700">{user?.name ?? 'Super Admin'}</span>
            </Button>
            <Button danger onClick={() => dispatch(logout())}>
              Logout
            </Button>
          </div>
        </Header>
        <Content className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-100 p-0 md:p-0">
          <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-6">
          <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
