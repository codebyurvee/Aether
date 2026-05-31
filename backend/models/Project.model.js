import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const experimentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  results: { type: String },
  date: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['ml', 'dl', 'nlp', 'cv', 'rl', 'mlops', 'research', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['idea', 'planning', 'in-progress', 'testing', 'deployed', 'completed', 'archived'],
    default: 'idea'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  subtasks: [subtaskSchema],
  technologies: [{
    type: String
  }],
  modelPerformance: {
    accuracy: { type: Number },
    loss: { type: Number },
    epochs: { type: Number },
    otherMetrics: { type: Map, of: mongoose.Schema.Types.Mixed }
  },
  githubUrl: {
    type: String
  },
  deploymentUrl: {
    type: String
  },
  deploymentStatus: {
    type: String,
    enum: ['not-deployed', 'deploying', 'deployed', 'failed'],
    default: 'not-deployed'
  },
  experiments: [experimentSchema],
  bugs: [{
    description: { type: String },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
  }],
  startDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-calculate progress based on subtasks
projectSchema.pre('save', function(next) {
  if (this.subtasks && this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(st => st.completed).length;
    this.progress = Math.round((completedSubtasks / this.subtasks.length) * 100);
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
