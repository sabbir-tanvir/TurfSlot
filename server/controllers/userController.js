import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const { full_name, email, password, role, image_url, image_public_id } = req.body;

  const user = await User.create({
    full_name,
    email,
    password,
    role: role || 'user',
    image_url,
    image_public_id
  });

  res.status(201).json({ 
    success: true, 
    data: user
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  let query = User.find();

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

  const users = await query;
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Cleanup old image if replaced
  if (req.body.image_public_id && user.image_public_id && req.body.image_public_id !== user.image_public_id) {
    await deleteFromCloudinary(user.image_public_id);
  }

  // If password is blank or not provided, remove it from update
  if (req.body.password === "" || !req.body.password) {
    delete req.body.password;
  }

  // Update fields
  Object.keys(req.body).forEach((key) => {
    user[key] = req.body[key];
  });

  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Delete image from Cloudinary
  if (user.image_public_id) {
    await deleteFromCloudinary(user.image_public_id);
  }

  await user.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
