//BACKEND/controllers/userContraller.js
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');
const Notification = require('../models/Notification');
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

// BACKEND/controllers/userController.js
exports.registerVehicleOwner = async (req, res) => {
  try {
    const { email, password, name, companyName, Gender, Phonenumber1, vehicles } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already registered" });

    user = new User({ email, password, role: "vehicle_owner" });
    await user.save();

    const vehicleOwnerProfile = new VehicleOwnerProfile({
      userId: user._id,
      name,
      companyName,
      Gender,
      Phonenumber1,
      vehicles: vehicles ? JSON.parse(vehicles) : [],
    });
    await vehicleOwnerProfile.save();

    res.status(201).json({ message: "Vehicle Owner registered successfully" });
  } catch (error) {
    console.error("Error registering vehicle owner:", error);
    res.status(500).json({ error: "Error registering vehicle owner" });
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

// BACKEND/controllers/userController.js
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
        if (profile) {
          const user = await User.findById(req.user.id).select('email'); // Fetch email from User model
          profile = {
            ...profile._doc,
            email: user.email,
            Gender: profile.Gender || '', // Add if missing
            Phonenumber1: profile.Phonenumber1 || '' // Add if missing
          };
        }
        break;
      case 'admin':
        profile = { role: 'admin' };
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

// ... (existing imports and exports)

exports.updateProfile = async (req, res) => {
  try {
    const { name, Lname, Gender, Phonenumber1, Phonenumber2 } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    let profile = await CustomerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.name = name || profile.name;
    profile.Lname = Lname || profile.Lname;
    profile.Gender = Gender || profile.Gender;
    profile.Phonenumber1 = Phonenumber1 || profile.Phonenumber1;
    profile.Phonenumber2 = Phonenumber2 || profile.Phonenumber2;
    if (profilePicture) profile.profilePicture = profilePicture;

    await profile.save();
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Error updating profile" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await CustomerProfile.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting account" });
  }
};

exports.subscribeToPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["platinum", "gold", "silver"].includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const profile = await CustomerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.plan = plan;
    await profile.save();

    // Create notification for admin
    const user = await User.findById(req.user.id);
    const notification = new Notification({
      message: `User ${user.email} subscribed to ${plan} plan`,
    });
    await notification.save();

    res.status(200).json({ message: "Subscribed to plan successfully", plan });
  } catch (error) {
    res.status(500).json({ error: "Error subscribing to plan" });
  }
};


// BACKEND/controllers/userController.js
exports.updateVehicleOwnerProfile = async (req, res) => {
  try {
    const { name, companyName, Gender, Phonenumber1 } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;

    let profile = await VehicleOwnerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    profile.name = name || profile.name;
    profile.companyName = companyName || profile.companyName;
    profile.Gender = Gender || profile.Gender;
    profile.Phonenumber1 = Phonenumber1 || profile.Phonenumber1;
    if (profilePicture) profile.profilePicture = profilePicture;

    await profile.save();

    // Include email from User model in response
    const user = await User.findById(req.user.id).select("email");
    const updatedProfile = {
      ...profile._doc,
      email: user.email,
    };

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating vehicle owner profile:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

