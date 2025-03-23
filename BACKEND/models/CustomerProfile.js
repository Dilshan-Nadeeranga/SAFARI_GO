//BACKEND/models/CustomerProfile.js
const mongoose = require("mongoose");

const CustomerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  Lname: { type: String },
  Gender: { type: String },
  Phonenumber1: { type: String },
  Phonenumber2: { type: String },
  profilePicture: { type: String },
  plan: {
    type: String,
    enum: ["platinum", "gold", "silver"],
    default: "silver",
  },
});

const CustomerProfile = mongoose.model("CustomerProfile", CustomerProfileSchema);
module.exports = CustomerProfile;