export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Invalid reference to related resource' });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
};
