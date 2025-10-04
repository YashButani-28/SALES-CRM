import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/layout/AppShell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { useAppDispatch, useAppSelector } from './hooks/storeHooks.js';
import { fetchCurrentUser } from './features/auth/authSlice.js';
import { setAuthToken } from './api/client.js';

const adminPermissions = ['manage_users', 'manage_roles', 'manage_permissions'];

const App = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route
            path="admin"
            element={<ProtectedRoute permissions={adminPermissions} module="user_management" mode="any" />}
          >
            <Route index element={<AdminPanel />} />
          </Route>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
