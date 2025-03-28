// BACKEND/routes/admin.js
const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { getAllVehicleOwners, searchVehicles, generateRentalReport } = require("../controllers/adminController");

router.get("/vehicle-owners", auth, authorize(["admin"]), getAllVehicleOwners);
router.get("/vehicles/search", auth, authorize(["admin"]), searchVehicles);
router.get("/reports/vehicles-rented", auth, authorize(["admin"]), generateRentalReport);

module.exports = router;