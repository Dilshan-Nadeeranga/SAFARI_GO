//Backend/controllers/safariController.js
const Safari = require('../models/Safari');
const Notification = require('../models/Notification');

// Create a new safari package
exports.createSafari = async (req, res) => {
  try {
    console.log('Creating safari package:', req.body);
    console.log('Files received:', req.files);
    console.log('User object:', req.user);
    
    const { title, description, location, duration, price, capacity, includes } = req.body;
    const guideId = req.user.id;

    console.log('Guide ID:', guideId);

    // Process includes field if it's a string (comma-separated)
    let includedItems = includes;
    if (typeof includes === 'string') {
      includedItems = includes.split(',').map(item => item.trim());
    }

    // Get image paths from uploaded files
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imagePaths.push(file.path);
      });
    }

    // Create the safari package
    const safari = new Safari({
      guideId,
      title,
      description,
      location,
      duration: Number(duration),
      price: Number(price),
      capacity: Number(capacity),
      includes: includedItems,
      images: imagePaths
    });

    await safari.save();

    // Create notification for admin to review the new safari package
    const newNotification = new Notification({
      type: 'SAFARI_CREATED',
      message: `New safari package "${title}" created by guide and pending review`,
      details: {
        safariId: safari._id,
        guideId
      }
    });
    await newNotification.save();

    res.status(201).json({
      message: 'Safari package created successfully and pending approval',
      safari
    });
  } catch (error) {
    console.error('Error creating safari package:', error);
    res.status(500).json({ error: 'Failed to create safari package' });
  }
};

// Get all safari packages
exports.getAllSafaris = async (req, res) => {
  try {
    const safaris = await Safari.find()
      .populate('guideId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(safaris);
  } catch (error) {
    console.error('Error fetching safari packages:', error);
    res.status(500).json({ error: 'Failed to fetch safari packages' });
  }
};

// Get a specific safari package
exports.getSafariById = async (req, res) => {
  try {
    const safari = await Safari.findById(req.params.id)
      .populate('guideId', 'name email');

    if (!safari) {
      return res.status(404).json({ message: 'Safari package not found' });
    }

    res.status(200).json(safari);
  } catch (error) {
    console.error('Error fetching safari package:', error);
    res.status(500).json({ error: 'Failed to fetch safari package' });
  }
};

// Update a safari package
exports.updateSafari = async (req, res) => {
  try {
    console.log('Updating safari package:', req.body);
    console.log('Files received:', req.files);
    
    const { title, description, location, duration, price, capacity, includes } = req.body;
    const guideId = req.user.id;
    
    // Process includes field if it's a string (comma-separated)
    let includedItems = includes;
    if (typeof includes === 'string') {
      includedItems = includes.split(',').map(item => item.trim());
    }

    // Find the safari first to check if it exists and belongs to this guide
    const existingSafari = await Safari.findOne({
      _id: req.params.id,
      guideId: req.user.id
    });

    if (!existingSafari) {
      return res.status(404).json({ message: 'Safari package not found or unauthorized' });
    }

    // Prepare update data
    const updateData = { 
      title, 
      description, 
      location, 
      duration: Number(duration), 
      price: Number(price), 
      capacity: Number(capacity), 
      includes: includedItems,
      status: 'pending_approval' // Reset to pending when updated
    };

    // Add new image paths if files are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => file.path);
      console.log('New image paths:', newImagePaths);
      
      // Either replace or append images based on your requirements
      // Option 1: Replace all images
      updateData.images = newImagePaths;
      
      // Option 2: Append to existing images
      // updateData.images = [...existingSafari.images, ...newImagePaths];
    }

    // Update the safari package
    const safari = await Safari.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Create notification for admin to review the updated safari package
    const newNotification = new Notification({
      type: 'SAFARI_UPDATED',
      message: `Safari package "${title}" updated by guide and pending review`,
      details: {
        safariId: safari._id,
        guideId: req.user.id
      }
    });
    await newNotification.save();

    res.status(200).json({
      message: 'Safari package updated successfully and pending approval',
      safari
    });
  } catch (error) {
    console.error('Error updating safari package:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to update safari package' });
  }
};

// Delete a safari package
exports.deleteSafari = async (req, res) => {
  try {
    const safari = await Safari.findOneAndDelete({
      _id: req.params.id,
      guideId: req.user.id
    });

    if (!safari) {
      return res.status(404).json({ message: 'Safari package not found or unauthorized' });
    }

    res.status(200).json({ message: 'Safari package deleted successfully' });
  } catch (error) {
    console.error('Error deleting safari package:', error);
    res.status(500).json({ error: 'Failed to delete safari package' });
  }
};

// Get safaris for the currently authenticated guide
exports.getGuideSafaris = async (req, res) => {
  try {
    const safaris = await Safari.find({ guideId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(safaris);
  } catch (error) {
    console.error('Error fetching guide safaris:', error);
    res.status(500).json({ error: 'Failed to fetch safari packages' });
  }
};

// Admin: Update safari status (approve or reject)
exports.updateSafariStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const safari = await Safari.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!safari) {
      return res.status(404).json({ message: 'Safari package not found' });
    }

    res.status(200).json({
      message: `Safari package ${status === 'active' ? 'approved' : 'rejected'}`,
      safari
    });
  } catch (error) {
    console.error('Error updating safari status:', error);
    res.status(500).json({ error: 'Failed to update safari status' });
  }
};

// Approve safari package
exports.approveSafari = async (req, res) => {
  try {
    const { feedback } = req.body;
    const safari = await Safari.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        adminFeedback: feedback || 'Approved'
      },
      { new: true }
    ).populate('guideId', 'name email');

    if (!safari) {
      return res.status(404).json({ message: 'Safari package not found' });
    }

    // Create notification for guide
    const newNotification = new Notification({
      type: 'SAFARI_APPROVED',
      message: `Your safari package "${safari.title}" has been approved`,
      details: {
        safariId: safari._id,
        feedback
      },
      recipientId: safari.guideId, // Add recipient ID for the guide
      recipientRole: 'guide'       // Specify recipient role
    });
    await newNotification.save();

    res.status(200).json({
      message: 'Safari package approved successfully',
      safari
    });
  } catch (error) {
    console.error('Error approving safari package:', error);
    res.status(500).json({ error: 'Failed to approve safari package' });
  }
};

// Reject safari package
exports.rejectSafari = async (req, res) => {
  try {
    const { feedback } = req.body;
    
    if (!feedback) {
      return res.status(400).json({ message: 'Feedback is required for rejecting a safari package' });
    }
    
    const safari = await Safari.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'inactive',
        adminFeedback: feedback
      },
      { new: true }
    );

    if (!safari) {
      return res.status(404).json({ message: 'Safari package not found' });
    }

    // Create notification for guide
    const newNotification = new Notification({
      type: 'SAFARI_REJECTED',
      message: `Your safari package "${safari.title}" has been rejected`,
      details: {
        safariId: safari._id,
        feedback
      }
    });
    await newNotification.save();

    res.status(200).json({
      message: 'Safari package rejected',
      safari
    });
  } catch (error) {
    console.error('Error rejecting safari package:', error);
    res.status(500).json({ error: 'Failed to reject safari package' });
  }
};
