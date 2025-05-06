const mongoose = require('mongoose');

const SafariSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending_approval', 'active', 'inactive'],
    default: 'pending_approval'
  },
  adminFeedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster lookups
SafariSchema.index({ guideId: 1 });
SafariSchema.index({ status: 1 });

const Safari = mongoose.model('Safari', SafariSchema);
module.exports = Safari;