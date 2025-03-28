const mongoose = require('mongoose');

const SafariSchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  includes: [{
    type: String
  }],
  images: [{
    type: String // paths to images
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_approval'],
    default: 'pending_approval'
  }
}, {
  timestamps: true
});

const Safari = mongoose.model('Safari', SafariSchema);
module.exports = Safari;
