// BACKEND/models/Vehicle.js
const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  picture: { type: String },
  type: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  licensePlate: { type: String },
  seatingCapacity: { type: Number, required: true },
  luggageCapacity: { type: Number, required: true },
  numberOfDoors: { type: Number, required: true },
});

module.exports = mongoose.model("Vehicle", VehicleSchema);