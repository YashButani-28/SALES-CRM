import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../hooks/storeHooks.js';
import { changePassword } from '../../features/auth/authSlice.js';
import * as yup from 'yup';

const schema = yup.object({
  currentPassword: yup.string().min(6, 'Current password must be at least 6 characters').required('Current password is required'),
  newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

const ChangePasswordForm = () => {
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(
        changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      ).unwrap();
      reset();
    } catch (error) {
      // handled via toast/message in slice
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Current Password</label>
        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} placeholder="Current password" />}
        />
        {errors.currentPassword && <p className="mt-1 text-sm text-rose-500">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">New Password</label>
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} placeholder="New secure password" />}
        />
        {errors.newPassword && <p className="mt-1 text-sm text-rose-500">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Confirm Password</label>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} placeholder="Confirm new password" />}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-rose-500">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="primary" htmlType="submit" loading={isSubmitting}>
        Change Password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
