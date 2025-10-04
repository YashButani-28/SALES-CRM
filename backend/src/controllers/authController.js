import { validationResult } from 'express-validator';
import { changePassword, loginUser, resetPasswordByEmail } from '../services/authService.js';

export const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await loginUser({ email, password });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const changePasswordController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const response = await changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword,
    });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, newPassword } = req.body;

  try {
    const response = await resetPasswordByEmail({ email, newPassword });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
