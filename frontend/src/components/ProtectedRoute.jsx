import { Spin } from 'antd';
import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/storeHooks';

const ProtectedRoute = ({ permission, permissions, module, modules, mode = 'all' }) => {
  const location = useLocation();
  const { token, user, status } = useAppSelector((state) => state.auth);
  const isSuperAdmin = useMemo(() => {
    const roleName = user?.role?.name?.toLowerCase();
    return roleName === 'super admin' || user?.email === 'admin@example.com';
  }, [user]);
  const moduleAccess = useMemo(() => {
    const map = new Map();
    (user?.modulePermissions || []).forEach((entry) => {
      map.set(entry.module, new Set(entry.actions || []));
    });
    return map;
  }, [user]);

  const requiredPermissions = useMemo(
    () => permissions ?? (permission ? [permission] : []),
    [permission, permissions]
  );
  const requiredModules = useMemo(
    () => modules ?? (module ? [module] : []),
    [module, modules]
  );

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isSuperAdmin && requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions[mode === 'any' ? 'some' : 'every']((perm) =>
      user.permissions?.includes(perm)
    );

    if (!hasPermissions) {
      return <Navigate to="/" replace />;
    }
  }

  if (!isSuperAdmin && requiredModules.length > 0) {
    const hasModuleAccess = requiredModules[mode === 'any' ? 'some' : 'every']((moduleKey) => {
      const actions = moduleAccess.get(moduleKey);
      return actions ? actions.has('read') : false;
    });

    if (!hasModuleAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
