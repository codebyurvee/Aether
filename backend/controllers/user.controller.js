import User from '../models/User.model.js';

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, currentPhase } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, currentPhase },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
