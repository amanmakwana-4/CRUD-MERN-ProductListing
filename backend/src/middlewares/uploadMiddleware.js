import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('[UPLOAD] File received:', file.originalname, 'MIME:', file.mimetype);
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    console.log('[UPLOAD] File accepted');
    cb(null, true);
  } else {
    console.error('[UPLOAD] File rejected - invalid MIME type');
    cb(new Error('Only image files are allowed'), false);
  }
};

console.log('[UPLOAD] Multer initialized');

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  return next();
};
