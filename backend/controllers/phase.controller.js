import Phase from '../models/Phase.model.js';

// @desc    Get all phases
// @route   GET /api/phases
// @access  Private
export const getPhases = async (req, res, next) => {
  try {
    const phases = await Phase.find({ userId: req.user._id }).sort({ phaseNumber: 1 });

    res.json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single phase
// @route   GET /api/phases/:id
// @access  Private
export const getPhase = async (req, res, next) => {
  try {
    const phase = await Phase.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    res.json({
      success: true,
      data: phase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update phase
// @route   POST /api/phases
// @access  Private
export const createPhase = async (req, res, next) => {
  try {
    const { phaseNumber } = req.body;

    // Check if phase already exists
    let phase = await Phase.findOne({
      userId: req.user._id,
      phaseNumber
    });

    if (phase) {
      // Update existing phase
      phase = await Phase.findByIdAndUpdate(
        phase._id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      // Create new phase
      phase = await Phase.create({
        ...req.body,
        userId: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      data: phase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update phase
// @route   PUT /api/phases/:id
// @access  Private
export const updatePhase = async (req, res, next) => {
  try {
    let phase = await Phase.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    phase = await Phase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: phase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete phase
// @route   DELETE /api/phases/:id
// @access  Private
export const deletePhase = async (req, res, next) => {
  try {
    const phase = await Phase.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found'
      });
    }

    await phase.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initialize default phases
// @route   POST /api/phases/initialize
// @access  Private
export const initializePhases = async (req, res, next) => {
  try {
    const defaultPhases = [
      {
        phaseNumber: 1,
        title: 'Foundation',
        description: 'Build strong fundamentals in Mathematics, Python, and ML Basics',
        goals: [
          'Master Python programming',
          'Learn Linear Algebra & Calculus',
          'Understand Probability & Statistics',
          'Complete basic ML course',
          'Build 3 beginner ML projects'
        ],
        isActive: true
      },
      {
        phaseNumber: 2,
        title: 'Core AI Mastery',
        description: 'Deep dive into Deep Learning, LLMs, and MLOps',
        goals: [
          'Master Deep Learning fundamentals',
          'Learn NLP and work with LLMs',
          'Understand Computer Vision',
          'Learn PyTorch/TensorFlow',
          'Deploy ML models to production',
          'Build 5 advanced AI projects'
        ],
        isActive: false
      },
      {
        phaseNumber: 3,
        title: 'Advanced & Research',
        description: 'Publications, Industry Projects, and Large-Scale Models',
        goals: [
          'Read and implement research papers',
          'Contribute to open-source AI projects',
          'Build production-grade AI systems',
          'Work on research publications',
          'Master system design for AI',
          'Land AI Engineer role'
        ],
        isActive: false
      }
    ];

    const phases = await Phase.insertMany(
      defaultPhases.map(phase => ({
        ...phase,
        userId: req.user._id
      }))
    );

    res.status(201).json({
      success: true,
      count: phases.length,
      data: phases
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phases already initialized'
      });
    }
    next(error);
  }
};
