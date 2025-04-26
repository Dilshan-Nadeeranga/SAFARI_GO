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

    user = new User({ email, password, role: 'user', name });
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

    user = new User({ email, password, role: 'guide', name });
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

    user = new User({ email, password, role: 'vehicle_owner', name });
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

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Admin registration should be restricted
    // Check if the request has a secret admin key
    const adminKey = req.headers['admin-key'];
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({ message: 'Not authorized to register admin' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    user = new User({ email, password, role: 'admin', name });
    await user.save();

    // Create admin notification
    await new Notification({
      type: 'ADMIN_CREATED',
      message: `New admin account created: ${email}`,
      details: { adminId: user._id }
    }).save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering admin' });
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
    console.log("getProfile called for user ID:", req.user.id, "with role:", req.user.role);
    
    let profile;
    switch (req.user.role) {
      case 'user':
        profile = await CustomerProfile.findOne({ userId: req.user.id });
        break;
      case 'guide':
        profile = await GuideProfile.findOne({ userId: req.user.id });
        break;
      case 'vehicle_owner':
        console.log("Looking for vehicle owner profile with userId:", req.user.id);
        profile = await VehicleOwnerProfile.findOne({ userId: req.user.id });
        console.log("Vehicle owner profile found:", profile ? "Yes" : "No");
        break;
      case 'admin':
        profile = { role: 'admin' }; // Minimal data for admin
        break;
      default:
        console.log("Invalid role:", req.user.role);
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    if (!profile) {
      console.log("Profile not found for user role:", req.user.role);
      
      // If it's a vehicle owner but no profile exists, create a default one
      if (req.user.role === 'vehicle_owner') {
        console.log("Creating default vehicle owner profile");
        const user = await User.findById(req.user.id);
        
        profile = new VehicleOwnerProfile({
          userId: req.user.id,
          name: user.email.split('@')[0],
          companyName: "Default Company",
          vehicles: []
        });
        await profile.save();
        console.log("Default vehicle owner profile created");
      } else {
        return res.status(404).json({ message: 'Profile not found' });
      }
    }
    
    console.log("Sending profile response");
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, Lname, Gender, Phonenumber1, Phonenumber2, email } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;
    const userId = req.user.id;
    
    let profile = await CustomerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Update profile fields
    profile.name = name || profile.name;
    profile.Lname = Lname || profile.Lname;
    profile.Gender = Gender || profile.Gender;
    profile.Phonenumber1 = Phonenumber1 || profile.Phonenumber1;
    profile.Phonenumber2 = Phonenumber2 || profile.Phonenumber2;
    if (profilePicture) profile.profilePicture = profilePicture;
    
    // Update user email if present
    if (email) user.email = email;
    
    await profile.save();
    await user.save();
    
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    await CustomerProfile.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
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
    console.error("Error subscribing to plan:", error);
    res.status(500).json({ error: "Error subscribing to plan" });
  }
};