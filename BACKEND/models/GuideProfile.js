//BACKEND/models/GuideProfile.js
const mongoose = require('mongoose');

const GuideProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  specialties: [{ type: String }],
});

const GuideProfile = mongoose.model('GuideProfile', GuideProfileSchema);
module.exports = GuideProfile;