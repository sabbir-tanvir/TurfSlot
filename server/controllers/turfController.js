import Turf from '../models/Turf.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Get all turfs
// @route   GET /api/turfs
// @access  Public
export const getTurfs = asyncHandler(async (req, res, next) => {
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Turf.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const turfs = await query;
  res.status(200).json({ success: true, count: turfs.length, data: turfs });
});

// @desc    Get single turf
// @route   GET /api/turfs/:id
// @access  Public
export const getTurf = asyncHandler(async (req, res, next) => {
  const turf = await Turf.findById(req.params.id);

  if (!turf) {
    return next(new ErrorResponse(`Turf not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: turf });
});

// @desc    Create new turf
// @route   POST /api/turfs
// @access  Private/Admin
export const createTurf = asyncHandler(async (req, res, next) => {
  const turf = await Turf.create(req.body);
  res.status(201).json({ success: true, data: turf });
});

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Private/Admin
export const updateTurf = asyncHandler(async (req, res, next) => {
  let turf = await Turf.findById(req.params.id);

  if (!turf) {
    return next(new ErrorResponse(`Turf not found with id of ${req.params.id}`, 404));
  }

  // Cleanup old image if replaced
  if (req.body.image_public_id && turf.image_public_id && req.body.image_public_id !== turf.image_public_id) {
    await deleteFromCloudinary(turf.image_public_id);
  }

  turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: turf });
});

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Private/Admin
export const deleteTurf = asyncHandler(async (req, res, next) => {
  const turf = await Turf.findById(req.params.id);

  if (!turf) {
    return next(new ErrorResponse(`Turf not found with id of ${req.params.id}`, 404));
  }

  // Delete image from Cloudinary
  if (turf.image_public_id) {
    await deleteFromCloudinary(turf.image_public_id);
  }

  await turf.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
