const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose'); // Add this missing import

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { text, rating, guideId, tripId } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create feedback
    const feedback = new Feedback({
      userId,
      text,
      rating,
      guideId: guideId || null,
      tripId: tripId || null,
    });
    await feedback.save();

    // Create notification for admin
    const newNotification = new Notification({
      type: 'FEEDBACK',
      message: `New feedback received with rating ${rating}/5`,
      details: {
        feedbackId: feedback._id,
        rating
      }
    });
    await newNotification.save();

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'email name')
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Get feedback for a specific user
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const feedback = await Feedback.find({ userId })
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ error: 'Failed to fetch user feedback' });
  }
};

// Respond to feedback (admin only)
exports.respondToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    console.log("[Admin Feedback] Request body received:", req.body);
    const { feedbackMsg } = req.body;
    
    console.log(`[Admin Feedback] Processing response to feedback ID: ${feedbackId}`);
    console.log(`[Admin Feedback] Response content: ${feedbackMsg?.substring(0, 30)}...`);
    
    // Validate the feedback ID format
    if (!feedbackId || !mongoose.Types.ObjectId.isValid(feedbackId)) {
      console.log(`[Admin Feedback] Invalid feedback ID: ${feedbackId}`);
      return res.status(400).json({ message: 'Invalid feedback ID format' });
    }
    
    // Find feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      console.log(`[Admin Feedback] Feedback not found with ID: ${feedbackId}`);
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Validate admin response
    if (!feedbackMsg || typeof feedbackMsg !== 'string') {
      console.log(`[Admin Feedback] Invalid admin response: ${typeof feedbackMsg}`);
      return res.status(400).json({ message: 'Valid admin response is required' });
    }
    
    console.log(`[Admin Feedback] Found feedback: ${feedback._id}, updating with admin response`);
    
    // Update feedback fields
    feedback.adminResponse = feedbackMsg;  // Store the value in adminResponse field
    feedback.status = 'responded';
    feedback.respondedAt = new Date();
    
    // Save with additional error handling
    try {
      const updatedFeedback = await feedback.save();
      console.log(`[Admin Feedback] Successfully updated feedback ${feedbackId}`);
      
      // Return success
      return res.status(200).json({ 
        message: 'Response added successfully', 
        feedback: updatedFeedback
      });
    } catch (saveError) {
      console.error(`[Admin Feedback] Error saving feedback: ${saveError.message}`);
      return res.status(500).json({ 
        error: 'Error saving feedback response', 
        details: saveError.message 
      });
    }
  } catch (error) {
    console.error(`[Admin Feedback] Unhandled error: ${error.message}`);
    console.error(error.stack);
    return res.status(500).json({ 
      error: 'Failed to respond to feedback', 
      details: error.message
    });
  }
};

// Assign feedback to a guide (admin only)
exports.assignFeedbackToGuide = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { guideId, notificationDetails } = req.body;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.guideId = guideId;
    feedback.status = 'assigned';
    feedback.assignedAt = new Date();
    await feedback.save();
    res.status(200).json({ message: 'Feedback assigned to guide', feedback });
    // Notify the guide with enhanced details
    const notificationMessage = notificationDetails ? 
      `Feedback from ${notificationDetails.userName} (${notificationDetails.rating}★) has been assigned to you: "${notificationDetails.feedbackText}". ${notificationDetails.requiredAction}` :
      `A feedback with rating ${feedback.rating}/5 has been assigned to you for review and response.`;
      
    const notification = new Notification({
      type: 'FEEDBACK_ASSIGNED',
      message: notificationMessage,
      recipientId: guideId,
      recipientRole: 'guide',
      details: { 
        feedbackId,
        actionUrl: '/guide-feedback',
        actionRequired: 'review_respond'
      }
    });
    await notification.save();
  } catch (error) {
    console.error('Error assigning feedback to guide:', error);
    res.status(500).json({ error: 'Failed to assign feedback to guide' });
  }
};

// Get assigned feedback for a guide
exports.getGuideFeedback = async (req, res) => {
  try {
    const guideId = req.user.id;
    
    const feedback = await Feedback.find({ guideId })
      .populate('userId', 'email name')
      .populate('tripId')
      .sort({ createdAt: -1 });
      
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching guide feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback assigned to you' });
  }
};

// Allow guide to respond to feedback
exports.guideRespondToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { guideResponse, resolveStatus } = req.body;
    const guideId = req.user.id;
    
    const feedback = await Feedback.findOne({ 
      _id: feedbackId,
      guideId: guideId 
    });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or not assigned to you' });
    }
    feedback.guideResponse = guideResponse;
    // If guide is resolving the feedback, update status
    if (resolveStatus) {
      feedback.status = 'resolved';
      feedback.resolvedAt = new Date();
    } else {
      feedback.status = 'responded';
    }
    await feedback.save();
    // Notify admin
    const newNotification = new Notification({
      type: 'FEEDBACK_RESPONDED',
      message: `Guide has ${resolveStatus ? 'resolved' : 'responded to'} a feedback.`,
      details: { 
        feedbackId: feedback._id,
        guideId,
        resolveStatus
      }
    });
    await newNotification.save();
    res.status(200).json({ 
      message: 'Response added successfully', 
      feedback 
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ error: 'Failed to add response to feedback' });
  }
};

// Get feedback report for admin
exports.getAdminFeedbackReport = async (req, res) => {
  try {
    // Get aggregated stats
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);
    // Get recent feedback with guide and user details
    const feedbacks = await Feedback.find()
      .populate('userId', 'email name')
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 });
    
    const response = {
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = {
          count: curr.count,
          avgRating: Number(curr.avgRating.toFixed(1))
        };
        return acc;
      }, {}),
      totalCount: await Feedback.countDocuments(),
      feedbacks
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating feedback report:', error);
    res.status(500).json({ error: 'Failed to generate feedback report' });
  }
};

// Mark feedback as resolved (admin or guide)
exports.resolveFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { resolveNote } = req.body;
    // Check if user is admin or the assigned guide
    let query = { _id: feedbackId };
    if (req.user.role === 'guide') {
      query.guideId = req.user.id;
    }
    const feedback = await Feedback.findOne(query);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or you are not authorized' });
    }
    feedback.status = 'resolved';
    feedback.resolvedAt = new Date();
    
    // Add resolution note to appropriate field based on user role
    if (req.user.role === 'admin') {
      feedback.adminResponse = resolveNote || feedback.adminResponse;
    } else {
      feedback.guideResponse = resolveNote || feedback.guideResponse;
    }
    await feedback.save();
    res.status(200).json({
      message: 'Feedback marked as resolved',
      feedback
    });
  } catch (error) {
    console.error('Error resolving feedback:', error);
    res.status(500).json({ error: 'Failed to resolve feedback' });
  }
};

module.exports = {
  submitFeedback: exports.submitFeedback,
  getAllFeedback: exports.getAllFeedback,
  getUserFeedback: exports.getUserFeedback,
  respondToFeedback: exports.respondToFeedback,
  assignFeedbackToGuide: exports.assignFeedbackToGuide,
  getGuideFeedback: exports.getGuideFeedback,
  guideRespondToFeedback: exports.guideRespondToFeedback,
  getAdminFeedbackReport: exports.getAdminFeedbackReport,
  resolveFeedback: exports.resolveFeedback
};