const mongoose = require('mongoose');

const VehicleRentalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  Fname: { 
    type: String, 
    required: true 
  },
  Lname: { 
    type: String, 
    required: true 
  },
  Phonenumber1: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  purpose: { 
    type: String 
  },
  driverNeeded: { 
    type: Boolean, 
    default: false 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'completed', 'cancelled'],
    default: 'pending_payment'
  },
  paymentId: { 
    type: String 
  },
  paymentDetails: { 
    type: Object 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the 'updatedAt' field on save
VehicleRentalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const VehicleRental = mongoose.model('VehicleRental', VehicleRentalSchema);
module.exports = VehicleRental;
