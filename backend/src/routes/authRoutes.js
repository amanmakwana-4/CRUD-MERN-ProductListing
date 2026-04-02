import express from 'express';
import { register, login, verifyOTP, getProfile, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', upload.single('profilePhoto'), asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/verify-otp', asyncHandler(verifyOTP));
router.get('/profile', authMiddleware, asyncHandler(getProfile));
router.put('/profile', authMiddleware, upload.single('profilePhoto'), asyncHandler(updateProfile));

export default router;
