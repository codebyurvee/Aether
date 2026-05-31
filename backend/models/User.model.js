import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  avatar: {
    type: String,
    default: ''
  },
  currentPhase: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date }
  },
  totalHoursCoded: {
    type: Number,
    default: 0
  },
  totalPapersRead: {
    type: Number,
    default: 0
  },
  aiReadinessScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  preferences: {
    pomodoroLength: { type: Number, default: 25 },
    shortBreak: { type: Number, default: 5 },
    longBreak: { type: Number, default: 15 },
    dailyGoalHours: { type: Number, default: 4 }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
