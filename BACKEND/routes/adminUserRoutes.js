const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');

const router = express.Router();

// Get all users (admin only)
router.get('/all', auth, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get a specific user by ID
router.get('/:userId', auth, authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Delete a user endpoint
router.delete('/:userId', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log('Delete user endpoint called for userId:', req.params.userId);
    
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if attempting to delete an admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    
    // Delete user-specific profile data based on role
    if (user.role === 'user') {
      await CustomerProfile.findOneAndDelete({ userId });
    } else if (user.role === 'guide') {
      await GuideProfile.findOneAndDelete({ userId });
    } else if (user.role === 'vehicle_owner') {
      await VehicleOwnerProfile.findOneAndDelete({ userId });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Create admin notification about user deletion
    const Notification = require('../models/Notification');
    await new Notification({
      type: 'USER_DELETED',
      message: `User ${user.email} has been deleted`,
      details: { deletedUser: user.email },
    }).save();
    
    console.log('User deleted successfully:', userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Update a user
router.put('/:userId', auth, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'guide', 'vehicle_owner', 'admin'].includes(role)) {
      user.role = role;
    }
    
    await user.save();
    
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

module.exports = router;
