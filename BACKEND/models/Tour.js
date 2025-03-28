const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  groupSize: { 
    type: Number, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true, // in hours
    default: 3
  },
  fee: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

const Tour = mongoose.model('Tour', TourSchema);
module.exports = Tour;
