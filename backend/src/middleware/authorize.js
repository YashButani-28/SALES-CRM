export const authorize = (requiredPermissions = [], options = {}) => {
  const { mode = 'all' } = options;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (requiredPermissions.length === 0) {
      return next();
    }

    const userPermissions = new Set(req.user.permissions);

    const satisfiesPermissions = mode === 'any'
      ? requiredPermissions.some((permission) => userPermissions.has(permission))
      : requiredPermissions.every((permission) => userPermissions.has(permission));

    if (!satisfiesPermissions) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    return next();
  };
};
