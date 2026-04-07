import Tournament from '../models/Tournament.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Private
export const getTournaments = asyncHandler(async (req, res, next) => {
  let query = Tournament.find().populate('turf_id');

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

  const tournaments = await query;
  res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
});

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private/Admin
export const createTournament = asyncHandler(async (req, res, next) => {
  const tournament = await Tournament.create(req.body);
  res.status(201).json({ success: true, data: tournament });
});

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
export const updateTournament = asyncHandler(async (req, res, next) => {
  let tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    return next(new ErrorResponse(`Tournament not found with id of ${req.params.id}`, 404));
  }

  tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: tournament });
});

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
export const deleteTournament = asyncHandler(async (req, res, next) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    return next(new ErrorResponse(`Tournament not found with id of ${req.params.id}`, 404));
  }

  await tournament.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
