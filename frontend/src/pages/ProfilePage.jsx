import { Card, Descriptions, Tag } from 'antd';
import { FaUserShield } from 'react-icons/fa';
import ChangePasswordForm from '../components/profile/ChangePasswordForm.jsx';
import { useAppSelector } from '../hooks/storeHooks.js';

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <Card className="rounded-2xl shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white">
            <FaUserShield size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <Descriptions column={1} className="mt-6">
          <Descriptions.Item label="Role">{user?.role?.name ?? 'No role assigned'}</Descriptions.Item>
          <Descriptions.Item label="Account Status">{user?.status}</Descriptions.Item>
          <Descriptions.Item label="Permissions">
            <div className="flex flex-wrap gap-2">
              {user?.permissions?.length ? (
                user.permissions.map((permission) => (
                  <Tag key={permission} color="purple">
                    {permission}
                  </Tag>
                ))
              ) : (
                <Tag>No permissions</Tag>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="rounded-2xl shadow-card" title="Change Password">
        <ChangePasswordForm />
      </Card>
    </div>
  );
};

export default ProfilePage;
