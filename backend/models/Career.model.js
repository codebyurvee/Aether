import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  round: { type: String },
  date: { type: Date },
  status: { type: String, enum: ['scheduled', 'completed', 'passed', 'failed'], default: 'scheduled' },
  notes: { type: String }
});

const careerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'job', 'freelance'],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  jobUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'accepted', 'completed'],
    default: 'wishlist'
  },
  appliedDate: {
    type: Date
  },
  salary: {
    amount: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  interviews: [interviewSchema],
  notes: {
    type: String
  },
  // For freelance
  projectName: {
    type: String
  },
  paymentReceived: {
    type: Boolean,
    default: false
  },
  paymentAmount: {
    type: Number
  }
}, {
  timestamps: true
});

const Career = mongoose.model('Career', careerSchema);

export default Career;
