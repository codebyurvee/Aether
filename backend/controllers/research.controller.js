import Research from '../models/Research.model.js';

// @desc    Get all research entries
// @route   GET /api/research
// @access  Private
export const getResearchEntries = async (req, res, next) => {
  try {
    const { type, status, priority, search, isFavorite } = req.query;
    
    let query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isFavorite) query.isFavorite = isFavorite === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const entries = await Research.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single research entry
// @route   GET /api/research/:id
// @access  Private
export const getResearchEntry = async (req, res, next) => {
  try {
    const entry = await Research.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Research entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create research entry
// @route   POST /api/research
// @access  Private
export const createResearchEntry = async (req, res, next) => {
  try {
    const entry = await Research.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update research entry
// @route   PUT /api/research/:id
// @access  Private
export const updateResearchEntry = async (req, res, next) => {
  try {
    let entry = await Research.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Research entry not found'
      });
    }

    entry = await Research.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete research entry
// @route   DELETE /api/research/:id
// @access  Private
export const deleteResearchEntry = async (req, res, next) => {
  try {
    const entry = await Research.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Research entry not found'
      });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
