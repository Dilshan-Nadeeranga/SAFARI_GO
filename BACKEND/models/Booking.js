const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  safariId: { type: mongoose.Schema.Types.ObjectId, ref: 'Safari', required: true },
  Fname: { type: String, required: true },
  Lname: { type: String, required: true },
  Phonenumber1: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  numberOfPeople: { type: Number, default: 1 },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'completed', 'yet_to_refund', 'refunded', 'cancelled'],
    default: 'pending_payment'
  },
  refundAmount: { type: Number },
  refundPercentage: { type: Number },
  daysUntilTrip: { type: Number },
  refundProcessedDate: { type: Date },
  paymentId: { type: String },
  paymentDetails: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;

