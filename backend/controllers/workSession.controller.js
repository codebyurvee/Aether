import WorkSession from '../models/WorkSession.model.js';
import User from '../models/User.model.js';

// @desc    Get all work sessions
// @route   GET /api/work-sessions
// @access  Private
export const getWorkSessions = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let query = { userId: req.user._id };
    
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sessions = await WorkSession.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single work session
// @route   GET /api/work-sessions/:id
// @access  Private
export const getWorkSession = async (req, res, next) => {
  try {
    const session = await WorkSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create work session
// @route   POST /api/work-sessions
// @access  Private
export const createWorkSession = async (req, res, next) => {
  try {
    const session = await WorkSession.create({
      ...req.body,
      userId: req.user._id
    });

    // Update user stats
    await updateUserStats(req.user._id, session);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work session
// @route   PUT /api/work-sessions/:id
// @access  Private
export const updateWorkSession = async (req, res, next) => {
  try {
    let session = await WorkSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
    }

    session = await WorkSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work session
// @route   DELETE /api/work-sessions/:id
// @access  Private
export const deleteWorkSession = async (req, res, next) => {
  try {
    const session = await WorkSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Work session not found'
      });
    }

    await session.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update user stats
const updateUserStats = async (userId, session) => {
  const user = await User.findById(userId);
  
  if (session.codingHours) {
    user.totalHoursCoded += session.codingHours;
  }
  
  if (session.papersRead) {
    user.totalPapersRead += session.papersRead;
  }
  
  // Update streak
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActive = user.streak.lastActiveDate 
    ? new Date(user.streak.lastActiveDate).setHours(0, 0, 0, 0)
    : null;
  
  if (!lastActive || lastActive < today) {
    const daysDiff = lastActive ? (today - lastActive) / (1000 * 60 * 60 * 24) : 0;
    
    if (daysDiff === 1) {
      user.streak.current += 1;
    } else if (daysDiff > 1) {
      user.streak.current = 1;
    }
    
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }
    
    user.streak.lastActiveDate = new Date();
  }
  
  await user.save();
};
