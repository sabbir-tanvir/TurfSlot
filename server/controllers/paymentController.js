import Payment from '../models/Payment.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = asyncHandler(async (req, res, next) => {
  let query = Payment.find().populate('booking_id');

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

  const payments = await query;
  res.status(200).json({ success: true, count: payments.length, data: payments });
});

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.create(req.body);
  res.status(201).json({ success: true, data: payment });
});
