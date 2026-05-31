import Career from '../models/Career.model.js';

// @desc    Get all career entries
// @route   GET /api/career
// @access  Private
export const getCareerEntries = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const entries = await Career.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single career entry
// @route   GET /api/career/:id
// @access  Private
export const getCareerEntry = async (req, res, next) => {
  try {
    const entry = await Career.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Career entry not found'
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

// @desc    Create career entry
// @route   POST /api/career
// @access  Private
export const createCareerEntry = async (req, res, next) => {
  try {
    const entry = await Career.create({
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

// @desc    Update career entry
// @route   PUT /api/career/:id
// @access  Private
export const updateCareerEntry = async (req, res, next) => {
  try {
    let entry = await Career.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Career entry not found'
      });
    }

    entry = await Career.findByIdAndUpdate(
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

// @desc    Delete career entry
// @route   DELETE /api/career/:id
// @access  Private
export const deleteCareerEntry = async (req, res, next) => {
  try {
    const entry = await Career.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Career entry not found'
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
