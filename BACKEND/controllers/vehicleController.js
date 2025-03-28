// BACKEND/controllers/vehicleController.js
const Vehicle = require("../models/Vehicle");

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching vehicles" });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    console.log("📥 addVehicle triggered");
    console.log("File received:", req.file);
    console.log("Body received:", req.body);

    const {
      type,
      brand,
      model,
      registrationNumber,
      licensePlate,
      seatingCapacity,
      luggageCapacity,
      numberOfDoors,
    } = req.body;

    const picture = req.file ? req.file.path : "";

    const newVehicle = new Vehicle({
      ownerId: req.user.id,
      picture,
      type,
      brand,
      model,
      registrationNumber,
      licensePlate,
      seatingCapacity,
      luggageCapacity,
      numberOfDoors,
    });

    await newVehicle.save();

    console.log("✅ Vehicle saved:", newVehicle);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error("❌ Error adding vehicle:", error);
    res.status(500).json({ error: error.message || "Error adding vehicle" });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting vehicle" });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    console.log("📝 updateVehicle triggered");
    console.log("File received:", req.file);
    console.log("Body received:", req.body);

    // Find the vehicle by ID and ensure it belongs to the user
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || vehicle.ownerId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Destructure the fields from the request body
    const {
      type,
      brand,
      model,
      registrationNumber,
      licensePlate,
      seatingCapacity,
      luggageCapacity,
      numberOfDoors,
    } = req.body;

    // Update the vehicle fields (only if new values are provided)
    vehicle.type = type || vehicle.type;
    vehicle.brand = brand || vehicle.brand;
    vehicle.model = model || vehicle.model;
    vehicle.registrationNumber = registrationNumber || vehicle.registrationNumber;
    vehicle.licensePlate = licensePlate || vehicle.licensePlate;
    vehicle.seatingCapacity = seatingCapacity || vehicle.seatingCapacity;
    vehicle.luggageCapacity = luggageCapacity || vehicle.luggageCapacity;
    vehicle.numberOfDoors = numberOfDoors || vehicle.numberOfDoors;

    // Update the picture if a new one is uploaded
    if (req.file) {
      vehicle.picture = req.file.path;
    }

    // Save the updated vehicle
    await vehicle.save();

    console.log("✅ Vehicle updated:", vehicle);
    res.status(200).json(vehicle);
  } catch (error) {
    console.error("❌ Error updating vehicle:", error);
    res.status(500).json({ error: error.message || "Error updating vehicle" });
  }
};