import Project from '../models/Project.model.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    
    let query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add subtask to project
// @route   POST /api/projects/:id/subtasks
// @access  Private
export const addSubtask = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.subtasks.push(req.body);
    await project.save();

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subtask
// @route   PUT /api/projects/:id/subtasks/:subtaskId
// @access  Private
export const updateSubtask = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const subtask = project.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    Object.assign(subtask, req.body);
    if (req.body.completed && !subtask.completedAt) {
      subtask.completedAt = new Date();
    }
    
    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subtask
// @route   DELETE /api/projects/:id/subtasks/:subtaskId
// @access  Private
export const deleteSubtask = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.subtasks.pull(req.params.subtaskId);
    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};
