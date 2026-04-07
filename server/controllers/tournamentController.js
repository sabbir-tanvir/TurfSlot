import Tournament from '../models/Tournament.js';

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('turf').sort('-createdAt');
    res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private/Admin
export const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json({ success: true, data: tournament });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tournament) return res.status(404).json({ success: false, error: 'Tournament not found' });
    res.status(200).json({ success: true, data: tournament });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
