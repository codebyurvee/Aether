import mongoose from 'mongoose';

const researchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['project-idea', 'paper-summary', 'startup-idea', 'experiment'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  content: {
    type: String
  },
  tags: [{
    type: String
  }],
  // For paper summaries
  paperUrl: {
    type: String
  },
  authors: [{
    type: String
  }],
  publicationYear: {
    type: Number
  },
  keyFindings: {
    type: String
  },
  // For startup ideas
  targetMarket: {
    type: String
  },
  indiaFocused: {
    type: Boolean,
    default: false
  },
  feasibility: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // For experiments
  hypothesis: {
    type: String
  },
  results: {
    type: String
  },
  status: {
    type: String,
    enum: ['idea', 'in-progress', 'completed', 'archived'],
    default: 'idea'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Text index for search
researchSchema.index({ title: 'text', description: 'text', content: 'text' });

const Research = mongoose.model('Research', researchSchema);

export default Research;
