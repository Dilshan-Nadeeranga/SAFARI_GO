//BACKEND/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  safariId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Safari', // Assuming a Safari model exists
    required: true,
  },
  Fname: { type: String, required: true },
  Lname: { type: String, required: true },
  Phonenumber1: { type: String },
  email: { type: String, required: true },
});

const Booking = mongoose.model('Booking', BookingSchema);
module.exports = Booking;

