import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res, next) => {
  let query = Order.find().populate('items.product_id');

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

  const orders = await query;
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.create(req.body);

  // Update stock for each product
  if (req.body.items && Array.isArray(req.body.items)) {
    for (const item of req.body.items) {
      if (item.product_id) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity }
        });
      }
    }
  }

  res.status(201).json({ success: true, data: order });
});
