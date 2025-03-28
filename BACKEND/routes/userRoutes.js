const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// Fix the middleware import to match the actual export
const { auth, authorize } = require("../middleware/auth");

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

router.post("/register/customer", upload.single("profilePicture"), registerCustomer);
router.post("/register/guide", registerGuide);
router.post("/register/vehicle_owner", registerVehicleOwner);
router.post("/login", login);

// These routes use auth middleware
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

// Mark a notification as read
router.put('/notifications/:notificationId/read', auth, authorize(['admin']), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error updating notification' });
  }
});

// Get a specific notification
router.get('/notifications/:notificationId', auth, authorize(['admin']), async (req, res) => {
  try {
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

// Mark a notification as read for a user
router.put('/notifications/:notificationId/read', auth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.notificationId,
        recipientId: req.user.id
      },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Error updating notification' });
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

router.get('/all', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
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

module.exports = router;