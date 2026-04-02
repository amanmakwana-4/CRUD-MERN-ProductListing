import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const status =
    err.status ||
    err.statusCode ||
    (err.name === 'ValidationError' ? 400 : undefined) ||
    (err.name === 'CastError' ? 400 : undefined) ||
    (err.code === 11000 ? 409 : undefined) ||
    500;

  const message =
    err.code === 11000
      ? `${Object.keys(err.keyPattern || {})[0] || 'Field'} already exists`
      : err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
  });
};
