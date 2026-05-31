import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  github: {
    username: { type: String },
    profileUrl: { type: String },
    totalRepos: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
    totalCommits: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
  linkedin: {
    profileUrl: { type: String },
    posts: [{
      content: { type: String },
      url: { type: String },
      date: { type: Date },
      engagement: { type: Number, default: 0 }
    }],
    lastUpdated: { type: Date }
  },
  twitter: {
    handle: { type: String },
    profileUrl: { type: String },
    tweets: [{
      content: { type: String },
      url: { type: String },
      date: { type: Date },
      engagement: { type: Number, default: 0 }
    }],
    lastUpdated: { type: Date }
  },
  kaggle: {
    username: { type: String },
    profileUrl: { type: String },
    tier: { type: String },
    competitions: { type: Number, default: 0 },
    datasets: { type: Number, default: 0 },
    notebooks: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
  portfolio: {
    url: { type: String },
    lastUpdated: { type: Date }
  },
  blog: {
    url: { type: String },
    posts: [{
      title: { type: String },
      url: { type: String },
      date: { type: Date }
    }]
  }
}, {
  timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
