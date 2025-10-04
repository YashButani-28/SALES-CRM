import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import {
  findUserByEmail,
  findUserById,
  getUserByIdWithPermissions,
  updatePasswordByEmail,
  updatePasswordById,
} from './userService.js';

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('User account is not active');
    error.status = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const payload = { sub: user.id, role: user.role_name };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

  const enrichedUser = await getUserByIdWithPermissions(user.id);

  return { token, user: enrichedUser };
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.status = 400;
    throw error;
  }

  await updatePasswordById(userId, newPassword);

  return { message: 'Password updated successfully' };
};

export const resetPasswordByEmail = async ({ email, newPassword }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('No account found with that email');
    error.status = 404;
    throw error;
  }

  await updatePasswordByEmail(email, newPassword);
  return { message: 'Password reset successfully' };
};
