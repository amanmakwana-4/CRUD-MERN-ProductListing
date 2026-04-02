import express from 'express';
import { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/', authMiddleware, upload.single('image'), asyncHandler(addProduct));
router.get('/', asyncHandler(getAllProducts));
router.get('/:id', asyncHandler(getProductById));
router.put('/:id', authMiddleware, upload.single('image'), asyncHandler(updateProduct));
router.delete('/:id', authMiddleware, asyncHandler(deleteProduct));

export default router;
