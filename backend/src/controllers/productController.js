import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { uploadFile } from '../utils/imagekitService.js';

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const parsedPrice = parseNumber(price);
    const parsedQuantity = parseNumber(quantity);

    if (!name || !description || parsedPrice === null || parsedQuantity === null) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    if (parsedPrice < 0 || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be valid non-negative values',
      });
    }

    let image = null;
    if (req.file) {
      image = await uploadFile(req.file.buffer, `product-${Date.now()}-${req.file.originalname}`);
    }

    const product = new Product({
      name,
      description,
      price: parsedPrice,
      quantity: parsedQuantity,
      image,
      createdBy: req.user.userId,
    });

    await product.save();
    await product.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const product = await Product.findById(req.params.id).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, quantity } = req.body;
    const parsedPrice = price !== undefined ? parseNumber(price) : undefined;
    const parsedQuantity = quantity !== undefined ? parseNumber(quantity) : undefined;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products',
      });
    }

    if (parsedPrice === null || parsedQuantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be valid non-negative values',
      });
    }

    if (parsedPrice !== undefined && parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be valid non-negative values',
      });
    }

    if (parsedQuantity !== undefined && parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be valid non-negative values',
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (parsedPrice !== undefined) updateData.price = parsedPrice;
    if (parsedQuantity !== undefined) updateData.quantity = parsedQuantity;

    if (req.file) {
      updateData.image = await uploadFile(req.file.buffer, `product-${Date.now()}-${req.file.originalname}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products',
      });
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
