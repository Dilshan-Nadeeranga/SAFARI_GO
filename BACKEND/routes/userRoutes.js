const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// Fix the middleware import to match the actual export
const { auth, authorize } = require("../middleware/auth");
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');

const {
  registerCustomer,
  registerGuide,
  registerVehicleOwner,
  registerAdmin,
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

// Registration and login routes
router.post("/register/customer", upload.single("profilePicture"), registerCustomer);
router.post("/register/guide", registerGuide);
router.post("/register/vehicle_owner", registerVehicleOwner);
router.post("/login", login);

// These routes use auth middleware
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single("profilePicture"), updateProfile);
router.delete("/profile", auth, deleteProfile);
router.post("/subscribe", auth, subscribeToPlan);

// ===== NOTIFICATION ROUTES =====
// Get notifications for the current user - IMPORTANT: This must come before the /:notificationId route
router.get('/notifications/user', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    console.log('Fetching notifications for user:', req.user.id);
    
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientRole: 'user'
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${notifications.length} notifications for user`);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Get all notifications - admin only
router.get('/notifications', auth, authorize(['admin']), async (req, res) => {
  const Notification = require('../models/Notification');
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Get a specific notification
router.get('/notifications/:notificationId', auth, authorize(['admin']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notification = await Notification.findById(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notification' });
  }
});

// Add route to get notifications for the current user
router.get('/notifications/user', auth, authorize(['user']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientRole: 'user'
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Add route to get all guides (used by the feedback form)
// Remove authentication requirement to make it a public endpoint
router.get('/guides', async (req, res) => {
  try {
    // Add better error handling and debugging
    console.log("Fetching guides for feedback form");
    
    // Find users with role 'guide'
    const guides = await User.find({ role: 'guide' })
      .select('_id email') // Just return minimal data needed
      .lean(); // Use lean for better performance
    
    console.log(`Found ${guides.length} guides`);
    res.status(200).json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Add better error handling and debugging
router.get('/all', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log("Fetching all users for admin");
    const users = await User.find().select('-password');
    
    // For simplicity, just return the basic user data without profiles
    // This avoids any potential errors related to profile fetching
    res.status(200).json(users);
    
    /* 
    // If you want to include profiles later, here's a more robust implementation:
    
    const enhancedUsers = [];
    
    for (const user of users) {
      try {
        let profileData = {};
        
        if (user.role === 'user') {
          const profile = await CustomerProfile.findOne({ userId: user._id });
          if (profile) {
            profileData = {
              firstName: profile.name,
              lastName: profile.Lname,
              profilePicture: profile.profilePicture
            };
          }
        } else if (user.role === 'guide') {
          const profile = await GuideProfile.findOne({ userId: user._id });
          if (profile) {
            profileData = {
              firstName: profile.name,
              profilePicture: profile.profilePicture
            };
          }
        } else if (user.role === 'vehicle_owner') {
          const profile = await VehicleOwnerProfile.findOne({ userId: user._id });
          if (profile) {
            profileData = {
              firstName: profile.name,
              companyName: profile.companyName
            };
          }
        }
        
        enhancedUsers.push({
          ...user.toObject(),
          profile: profileData
        });
      } catch (profileError) {
        console.error(`Error fetching profile for user ${user._id}:`, profileError);
        enhancedUsers.push(user.toObject()); // Add user without profile
      }
    }
    
    res.status(200).json(enhancedUsers);
    */
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Admin registration route
router.post("/register/admin", registerAdmin);

// Token validation endpoint
router.get("/validate-token", auth, (req, res) => {
  res.status(200).json({
    valid: true,
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

// Token refresh endpoint
router.post("/refresh-token", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the existing token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Find the user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate new token
      const newToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token: newToken });
    });
  } catch (error) {
    res.status(500).json({ error: "Error refreshing token" });
  }
});

// Role management (admin only)
router.put("/update-role/:userId", auth, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    // Validate role
    if (!['user', 'guide', 'vehicle_owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create notification for role change
    const Notification = require('../models/Notification');
    await new Notification({
      type: 'ROLE_CHANGED',
      message: `User role updated to ${role}`,
      details: { userId, updatedBy: req.user.id }
    }).save();
    res.status(200).json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error updating role" });
  }
});

// Logout (token invalidation)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a real application, you would add the token to a blacklist
    // or implement Redis-based token tracking
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error during logout" });
  }
});

// Add premium subscription routes
router.post('/premium/subscribe', auth, async (req, res) => {
  try {
    const { duration, plan } = req.body; // duration in months, plan type
    
    if (!duration || !Number.isInteger(duration) || duration < 1) {
      return res.status(400).json({ message: 'Please provide a valid subscription duration in months' });
    }
    
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate premium expiration date
    const now = new Date();
    const premiumUntil = user.isPremium && user.premiumUntil > now 
      ? new Date(user.premiumUntil.setMonth(user.premiumUntil.getMonth() + duration))
      : new Date(now.setMonth(now.getMonth() + duration));
    
    // Set discount rate based on plan
    let discountRate = 5; // Default for bronze
    if (plan === 'silver') discountRate = 10;
    if (plan === 'gold') discountRate = 15;
    
    // Update user premium status
    user.isPremium = true;
    user.premiumUntil = premiumUntil;
    user.premiumPlan = plan || 'bronze';
    user.discountRate = discountRate;
    
    // Add to subscription history
    user.subscriptionHistory = user.subscriptionHistory || [];
    user.subscriptionHistory.push({
      plan: plan || 'bronze',
      purchasedAt: new Date(),
      expiresAt: premiumUntil,
      amount: duration === 1 ? 9.99 : duration === 3 ? 14.99 : 24.99
    });
    
    await user.save();
    
    // Create notification
    const Notification = require('../models/Notification');
    await new Notification({
      type: 'PREMIUM_SUBSCRIBED',
      message: `User upgraded to ${plan || 'premium'} plan until ${premiumUntil.toDateString()}`,
      recipientId: user._id,
      recipientRole: 'user'
    }).save();
    
    res.status(200).json({ 
      message: `Premium ${plan || 'subscription'} activated`,
      premiumUntil: premiumUntil,
      discountRate: `${discountRate}%` // Return the plan-specific discount rate
    });
  } catch (error) {
    console.error('Error subscribing to premium:', error);
    res.status(500).json({ error: 'Error processing premium subscription' });
  }
});

// Get premium status
router.get('/premium/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isPremiumActive = user.isPremium && user.premiumUntil > new Date();
    
    res.status(200).json({
      isPremium: isPremiumActive,
      premiumUntil: user.isPremium ? user.premiumUntil : null,
      discountRate: isPremiumActive ? (user.discountRate || 15) : 0, // Use user's specific discount rate
      plan: user.premiumPlan
    });
  } catch (error) {
    console.error('Error fetching premium status:', error);
    res.status(500).json({ error: 'Error fetching premium status' });
  }
});

// Fix the premium subscribers endpoint - ensure it's correctly defined
// Add endpoint for admins to view all premium subscribers
router.get('/premium/subscribers', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log('Fetching premium subscribers');
    const now = new Date();
    
    const subscribers = await User.find({
      isPremium: true,
      premiumUntil: { $gt: now }
    }).select('email name premiumPlan premiumUntil discountRate subscriptionHistory');
    
    console.log(`Found ${subscribers.length} premium subscribers`);
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching premium subscribers:', error);
    res.status(500).json({ error: 'Error fetching premium subscribers' });
  }
});

// Remove the delete-user route from here since we're handling it directly in server.js
// This prevents confusion with multiple routes for the same endpoint

module.exports = router;