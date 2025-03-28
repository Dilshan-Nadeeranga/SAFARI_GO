// BACKEND/routes/vehicle.js
const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const { getVehicles, addVehicle, deleteVehicle, updateVehicle } = require("../controllers/vehicleController"); // Add updateVehicle
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.get("/", auth, authorize(["vehicle_owner"]), getVehicles);
router.post("/", auth, authorize(["vehicle_owner"]), upload.single("picture"), addVehicle);
router.delete("/:id", auth, authorize(["vehicle_owner"]), deleteVehicle);
router.put("/:id", auth, authorize(["vehicle_owner"]), upload.single("picture"), updateVehicle); // New PUT route

module.exports = router;