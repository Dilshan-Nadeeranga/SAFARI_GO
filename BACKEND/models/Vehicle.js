const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    required: true 
  },
  licensePlate: { 
    type: String, 
    required: true, 
    unique: true 
  },
  capacity: { 
    type: Number, 
    default: 4 
  },
  features: [{ 
    type: String 
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'unavailable'],
    default: 'active'
  },
  currentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  // Add images field to store multiple image paths
  images: [{
    type: String
  }],
  // New fields for owner information and documents
  ownerName: {
    type: String
  },
  contactNumber: {
    type: String
  },
  licenseDoc: {
    type: String
  },
  insuranceDoc: {
    type: String
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);
module.exports = Vehicle;
