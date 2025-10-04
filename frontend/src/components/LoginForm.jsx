import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Input } from 'antd';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks.js';
import { login } from '../features/auth/authSlice.js';
import ForgotPasswordModal from './forms/ForgotPasswordModal.jsx';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAppSelector((state) => state.auth);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // error handled via toast in slice
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface w-full max-w-lg space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Sign in to Sales CRM</h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your dashboard and manage customer relationships with ease.
          </p>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} id="email" size="large" placeholder="you@example.com" />}
          />
          {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => <Input.Password {...field} id="password" size="large" placeholder="••••••••" />}
          />
          {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-brand hover:underline"
            onClick={() => setForgotOpen(true)}
          >
            Forgot password?
          </button>
        </div>
        <Button type="primary" htmlType="submit" size="large" block loading={status === 'loading'}>
          Sign In
        </Button>
      </form>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
};

export default LoginForm;
