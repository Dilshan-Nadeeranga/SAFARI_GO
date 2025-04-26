const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Tour = require('../models/Tour');
const GuideProfile = require('../models/GuideProfile');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get tours for a guide
router.get('/tours', auth, authorize(['guide', 'admin']), async (req, res) => {
    try {
        let tours;
        
        if (req.user.role === 'admin') {
            tours = await Tour.find();
        } else {
            // Get tours belonging to the current guide
            tours = await Tour.find({ guideId: req.user.id });
        }
        
        // If no tours exist yet, return empty array instead of 404
        res.status(200).json(tours || []);
    } catch (error) {
        console.error('Error fetching tours:', error);
        res.status(500).json({ error: 'Error fetching tours' });
    }
});

// Update guide profile
router.put('/profile', auth, authorize(['guide']), upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, experienceYears, specialties } = req.body;
        
        // Find the guide profile
        let profile = await GuideProfile.findOne({ userId: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ message: 'Guide profile not found' });
        }
        
        // Update fields
        profile.name = name || profile.name;
        profile.experienceYears = experienceYears || profile.experienceYears;
        
        // Handle specialties - convert from comma-separated string to array
        if (specialties) {
            profile.specialties = specialties.split(',').map(item => item.trim());
        }
        
        // Handle profile picture update if a new file was uploaded
        if (req.file) {
            profile.profilePicture = req.file.path;
        }
        
        await profile.save();
        
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error updating guide profile:', error);
        res.status(500).json({ error: 'Error updating guide profile' });
    }
});

// Get notifications for the current guide
router.get('/notifications', auth, authorize(['guide']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientRole: 'guide'
    }).sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching guide notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark a notification as read
router.put('/notifications/:notificationId/read', auth, authorize(['guide']), async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.notificationId,
        recipientId: req.user.id,
        recipientRole: 'guide'
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

module.exports = router;
