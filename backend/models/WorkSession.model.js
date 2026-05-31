import mongoose from 'mongoose';

const workSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['pomodoro', 'deep-work', 'daily-log'],
    default: 'daily-log'
  },
  codingHours: {
    type: Number,
    default: 0
  },
  researchHours: {
    type: Number,
    default: 0
  },
  papersRead: {
    type: Number,
    default: 0
  },
  kaggleHours: {
    type: Number,
    default: 0
  },
  sleepHours: {
    type: Number,
    default: 0
  },
  gymMinutes: {
    type: Number,
    default: 0
  },
  focusSessions: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
    default: 'okay'
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Index for efficient date queries
workSessionSchema.index({ userId: 1, date: -1 });

const WorkSession = mongoose.model('WorkSession', workSessionSchema);

export default WorkSession;
