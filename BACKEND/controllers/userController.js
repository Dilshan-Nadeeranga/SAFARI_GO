//BACKEND/controllers/userContraller.js
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');
const jwt = require('jsonwebtoken');

exports.registerCustomer = async (req, res) => {
  try {
    const { email, password, name, Lname, Gender, Phonenumber1, Phonenumber2 } = req.body;
    const profilePicture = req.file ? req.file.path : '';

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    user = new User({ email, password, role: 'user' });
    await user.save();

    const customerProfile = new CustomerProfile({
      userId: user._id,
      name,
      Lname,
      Gender,
      Phonenumber1,
      Phonenumber2,
      profilePicture,
    });
    await customerProfile.save();

    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering customer' });
  }
};

exports.registerGuide = async (req, res) => {
  try {
    const { email, password, name, experienceYears, specialties } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    user = new User({ email, password, role: 'guide' });
    await user.save();

    const guideProfile = new GuideProfile({
      userId: user._id,
      name,
      experienceYears,
      specialties: specialties.split(','), // Assuming specialties come as a comma-separated string
    });
    await guideProfile.save();

    res.status(201).json({ message: 'Guide registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering guide' });
  }
};

exports.registerVehicleOwner = async (req, res) => {
  try {
    const { email, password, name, companyName, vehicles } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    user = new User({ email, password, role: 'vehicle_owner' });
    await user.save();

    const vehicleOwnerProfile = new VehicleOwnerProfile({
      userId: user._id,
      name,
      companyName,
      vehicles: JSON.parse(vehicles), // Assuming vehicles come as a JSON string
    });
    await vehicleOwnerProfile.save();

    res.status(201).json({ message: 'Vehicle Owner registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering vehicle owner' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let profile;
    switch (req.user.role) {
      case 'user':
        profile = await CustomerProfile.findOne({ userId: req.user.id });
        break;
      case 'guide':
        profile = await GuideProfile.findOne({ userId: req.user.id });
        break;
      case 'vehicle_owner':
        profile = await VehicleOwnerProfile.findOne({ userId: req.user.id });
        break;
      case 'admin':
        profile = { role: 'admin' }; // Minimal data for admin
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};