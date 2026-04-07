import Product from '../models/Product.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res, next) => {
  let query = Product.find();

  // Handle Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ').replace('created_date', 'createdAt');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Handle Limit
  const limit = parseInt(req.query.limit, 10) || 500;
  query = query.limit(limit);

  const products = await query;
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Cleanup old image if replaced
  if (req.body.image_public_id && product.image_public_id && req.body.image_public_id !== product.image_public_id) {
    await deleteFromCloudinary(product.image_public_id);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Delete image from Cloudinary
  if (product.image_public_id) {
    await deleteFromCloudinary(product.image_public_id);
  }

  await product.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
