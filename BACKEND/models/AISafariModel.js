const mongoose = require("mongoose");

const safariPreferencesSchema = new mongoose.Schema({
  weather: { type: String, required: true, enum: ["Hot", "Cool", "Mild"] },
  animals: { type: [String], required: true },
  travelMonth: { type: String, required: true },
  budget: { type: String, required: true, enum: ["Low", "Medium", "High"] },
});

const safariItinerarySchema = new mongoose.Schema({
  preferences: { type: safariPreferencesSchema, required: true },
  location: { type: String, required: true },
  dates: { type: String, required: true },
  package: { type: String, required: true },
  duration: { type: String, required: true },
  cost: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SafariItinerary", safariItinerarySchema);