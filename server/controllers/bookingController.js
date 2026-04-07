import Booking from '../models/Booking.js';
import Turf from '../models/Turf.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = asyncHandler(async (req, res, next) => {
  let query = Booking.find().populate('turf_id');

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

  const bookings = await query;
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('turf_id');
  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: booking });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res, next) => {
  const turf = await Turf.findById(req.body.turf_id);
  if (!turf) {
    return next(new ErrorResponse(`Turf not found with id of ${req.body.turf_id}`, 404));
  }

  // Check for conflicts
  const conflict = await Booking.findOne({
    turf_id: req.body.turf_id,
    date: req.body.date,
    status: { $ne: 'cancelled' },
    start_hour: { $lt: req.body.end_hour || (req.body.start_hour + 1) },
    end_hour: { $gt: req.body.start_hour },
  });

  if (conflict) {
    return next(new ErrorResponse('Time slot already booked', 400));
  }

  const booking = await Booking.create({
    ...req.body,
    turf_id: req.body.turf_id,
    turf_name: turf.name,
  });

  // Create payment record if status is paid or partial
  if (['paid', 'partial'].includes(req.body.payment_status)) {
    await Payment.create({
      booking_id: booking._id,
      amount: req.body.total_price,
      status: 'completed',
      method: req.body.payment_method || 'bkash',
      transaction_id: req.body.txn_id,
      customer_name: req.body.customer_name,
      customer_phone: req.body.customer_phone,
    });
  }

  res.status(201).json({ success: true, data: booking });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: booking });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  await booking.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
