import Turf from '../models/Turf.js';

// @desc    Get all turfs
// @route   GET /api/turfs
// @access  Public
export const getTurfs = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single turf
// @route   GET /api/turfs/:id
// @access  Public
export const getTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ success: false, error: 'Turf not found' });
    res.status(200).json({ success: true, data: turf });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new turf
// @route   POST /api/turfs
// @access  Private/Admin
export const createTurf = async (req, res) => {
  try {
    const turf = await Turf.create(req.body);
    res.status(201).json({ success: true, data: turf });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Private/Admin
export const updateTurf = async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!turf) return res.status(404).json({ success: false, error: 'Turf not found' });
    res.status(200).json({ success: true, data: turf });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Private/Admin
export const deleteTurf = async (req, res) => {
  try {
    const turf = await Turf.findByIdAndDelete(req.params.id);
    if (!turf) return res.status(404).json({ success: false, error: 'Turf not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
