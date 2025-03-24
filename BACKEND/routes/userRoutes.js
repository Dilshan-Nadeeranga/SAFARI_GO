const express = require("express");
const multer = require("multer");
const path = require("path");
const { auth, authorize } = require("../middleware/auth");
const {
  registerCustomer,
  registerGuide,
  registerVehicleOwner,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  subscribeToPlan,
} = require("../controllers/userController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post("/register/customer", upload.single("profilePicture"), registerCustomer);
router.post("/register/guide", registerGuide);
router.post("/register/vehicle_owner", registerVehicleOwner);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);
router.delete("/profile", auth, deleteProfile);
router.post("/subscribe", auth, subscribeToPlan);

// New endpoints
router.get('/notifications', auth, authorize(['admin']), async (req, res) => {
  const Notification = require('../models/Notification');
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

router.get('/all', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;