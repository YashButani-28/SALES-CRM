import { yupResolver } from '@hookform/resolvers/yup';
import { Modal, Input } from 'antd';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../hooks/storeHooks.js';
import { resetPassword } from '../../features/auth/authSlice.js';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
});

const ForgotPasswordModal = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: { email: '', newPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(resetPassword(values)).unwrap();
      reset();
      onClose();
    } catch (error) {
      // feedback handled via toast in slice
    }
  };

  return (
    <Modal
      title="Forgot Password"
      open={open}
      onCancel={() => {
        reset();
        onClose();
      }}
      okText="Reset Password"
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} placeholder="you@example.com" />}
          />
          {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
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
      </div>
    </Modal>
  );
};

ForgotPasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordModal;
