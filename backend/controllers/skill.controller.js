import Skill from '../models/Skill.model.js';

// @desc    Get all skills for user
// @route   GET /api/skills
// @access  Private
export const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query).sort({ progress: -1, name: 1 });

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Private
export const getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create skill
// @route   POST /api/skills
// @access  Private
export const createSkill = async (req, res, next) => {
  try {
    const skill = await Skill.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
export const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initialize default skills
// @route   POST /api/skills/initialize
// @access  Private
export const initializeSkills = async (req, res, next) => {
  try {
    const defaultSkills = [
      { name: 'Python', category: 'foundation' },
      { name: 'Linear Algebra', category: 'foundation' },
      { name: 'Probability & Statistics', category: 'foundation' },
      { name: 'Machine Learning', category: 'core' },
      { name: 'Deep Learning', category: 'core' },
      { name: 'NLP & LLMs', category: 'core' },
      { name: 'Computer Vision', category: 'core' },
      { name: 'PyTorch', category: 'tools' },
      { name: 'TensorFlow', category: 'tools' },
      { name: 'MLOps & Deployment', category: 'deployment' },
      { name: 'LangChain', category: 'tools' },
      { name: 'Vector Databases', category: 'tools' },
      { name: 'Cloud Platforms', category: 'deployment' },
      { name: 'Research Paper Reading', category: 'advanced' },
      { name: 'System Design for AI', category: 'advanced' },
      { name: 'Prompt Engineering', category: 'advanced' }
    ];

    const skills = await Skill.insertMany(
      defaultSkills.map(skill => ({
        ...skill,
        userId: req.user._id
      }))
    );

    res.status(201).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Skills already initialized'
      });
    }
    next(error);
  }
};
