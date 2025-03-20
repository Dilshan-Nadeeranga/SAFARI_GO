//BACKEND/routes/userRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const { registerCustomer, registerGuide, registerVehicleOwner, login, getProfile } = require('../controllers/userController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.post('/register/customer', upload.single('profilePicture'), registerCustomer);
router.post('/register/guide', registerGuide);
router.post('/register/vehicle_owner', registerVehicleOwner);
router.post('/login', login);
router.get('/profile', auth, getProfile);

module.exports = router;