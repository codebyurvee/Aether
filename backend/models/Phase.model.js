import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const phaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phaseNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  goals: [{
    type: String
  }],
  tasks: [taskSchema],
  deadline: {
    type: Date
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for user and phase number
phaseSchema.index({ userId: 1, phaseNumber: 1 }, { unique: true });

const Phase = mongoose.model('Phase', phaseSchema);

export default Phase;
