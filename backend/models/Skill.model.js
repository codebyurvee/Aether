import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String },
  type: { type: String, enum: ['course', 'book', 'article', 'video', 'other'], default: 'other' }
});

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['foundation', 'core', 'advanced', 'tools', 'deployment'],
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  masteryLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  lastPracticed: {
    type: Date
  },
  resources: [resourceSchema],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for user and skill name
skillSchema.index({ userId: 1, name: 1 }, { unique: true });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
