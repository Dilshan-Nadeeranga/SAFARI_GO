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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// Make sure we have only one model definition
let Safari;
try {
  Safari = mongoose.model('Safari');
} catch (e) {
  Safari = mongoose.model('Safari', SafariSchema);
}

module.exports = Safari;
