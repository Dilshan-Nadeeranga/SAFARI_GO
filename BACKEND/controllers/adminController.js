// BACKEND/controllers/adminController.js
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

exports.getAllVehicleOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: "vehicle_owner" }).select("-password");
    const ownersWithVehicles = await Promise.all(
      owners.map(async (owner) => {
        const vehicles = await Vehicle.find({ ownerId: owner._id });
        return { ...owner._doc, vehicles };
      })
    );
    res.status(200).json(ownersWithVehicles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching vehicle owners" });
  }
};

exports.searchVehicles = async (req, res) => {
  try {
    const { licensePlate } = req.query;
    const vehicles = await Vehicle.find({ licensePlate: { $regex: licensePlate, $options: "i" } });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Error searching vehicles" });
  }
};

exports.generateRentalReport = async (req, res) => {
  // Placeholder: Assumes a rental system exists
  res.status(200).json({ message: "Report generation not implemented" });
};