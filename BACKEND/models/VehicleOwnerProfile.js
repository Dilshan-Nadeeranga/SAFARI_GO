//BACKEND/models/VehicleOwnerProfile.js
const mongoose = require('mongoose');

const VehicleOwnerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  companyName: { type: String },
  vehicles: [{
    type: { type: String, required: true },
    licensePlate: { type: String, required: true },
  }],
});

const VehicleOwnerProfile = mongoose.model('VehicleOwnerProfile', VehicleOwnerProfileSchema);
module.exports = VehicleOwnerProfile;