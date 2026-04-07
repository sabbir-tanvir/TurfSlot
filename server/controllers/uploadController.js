import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
export const uploadFile = asyncHandler(async (req, res, next) => {
  console.log('Upload request received');
  console.log('File:', req.file);

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  res.status(200).json({
    success: true,
    data: {
      file_url: req.file.path,
      public_id: req.file.filename
    }
  });
});
