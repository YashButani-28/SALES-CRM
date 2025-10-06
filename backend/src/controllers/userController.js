import { validationResult } from 'express-validator';
import { createUser } from '../services/userService.js';

export const createUserController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, roleId, status } = req.body;

  try {
    const user = await createUser({ name, email, password, roleId, status });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  const { user } = req;
  return res.json({ user });
};
