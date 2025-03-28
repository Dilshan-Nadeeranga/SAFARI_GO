<<<<<<< Updated upstream
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isForAdmin: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  },
  adminResponse: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;
=======
//BACKEND/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true },  // Rating from 1 to 5
    comment: { type: String, required: true },
    safariPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'SafariPackage', required: true },
    status: { type: String, default: 'Pending' },  // Default is 'Pending'
    assignedGuideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide' },  // Guide assigned to feedback
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
>>>>>>> Stashed changes
