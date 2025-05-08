const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Submit new feedback from a user
exports.submitFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback details from request body and user ID from authenticated user
    const { text, rating, guideId, tripId } = req.body;
    const userId = req.user.id;

    // Step 2: Validate rating (must be between 1 and 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Step 3: Create a new feedback document
    const feedback = new Feedback({
      userId,
      text,
      rating,
      guideId: guideId || null,
      tripId: tripId || null,
    });

    // Step 4: Save the feedback to the database
    await feedback.save();

    // Step 5: Create a notification for admin about the new feedback
    const newNotification = new Notification({
      type: 'FEEDBACK',
      message: `New feedback received with rating ${rating}/5`,
      details: {
        feedbackId: feedback._id,
        rating
      }
    });
    await newNotification.save();

    // Step 6: Return success response with the created feedback
    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback 
    });
  } catch (error) {
    // Step 7: Handle any errors during the process
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Retrieve all feedback (admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    // Step 1: Fetch all feedback from the database, populating user and guide details
    const feedback = await Feedback.find()
      .populate('userId', 'email name')
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 }); // Sort by creation date (newest first)

    // Step 2: Return the feedback list
    res.status(200).json(feedback);
  } catch (error) {
    // Step 3: Handle any errors during fetching
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Retrieve feedback for a specific user
exports.getUserFeedback = async (req, res) => {
  try {
    // Step 1: Get the authenticated user's ID
    const userId = req.user.id;

    // Step 2: Fetch feedback for the user, populating guide details
    const feedback = await Feedback.find({ userId })
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 });

    // Step 3: Return the user's feedback
    res.status(200).json(feedback);
  } catch (error) {
    // Step 4: Handle any errors during fetching
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ error: 'Failed to fetch user feedback' });
  }
};

// Admin responds to feedback
exports.respondToFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback ID from params and response message from body
    const { feedbackId } = req.params;
    const { feedbackMsg } = req.body;
    
    // Step 2: Validate feedback ID format
    if (!feedbackId || !mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: 'Invalid feedback ID format' });
    }
    
    // Step 3: Find the feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Step 4: Validate the admin response
    if (!feedbackMsg || typeof feedbackMsg !== 'string') {
      return res.status(400).json({ message: 'Valid admin response is required' });
    }
    
    // Step 5: Update feedback with admin response, status, and response timestamp
    feedback.adminResponse = feedbackMsg;
    feedback.status = 'responded';
    feedback.respondedAt = new Date();
    
    // Step 6: Save the updated feedback
    const updatedFeedback = await feedback.save();
    
    // Step 7: Return success response with updated feedback
    return res.status(200).json({ 
      message: 'Response added successfully', 
      feedback: updatedFeedback
    });
  } catch (error) {
    // Step 8: Handle any errors during the process
    console.error(`[Admin Feedback] Unhandled error: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to respond to feedback', 
      details: error.message
    });
  }
};

// Assign feedback to a guide (admin only)
exports.assignFeedbackToGuide = async (req, res) => {
  try {
    // Step 1: Extract feedback ID and guide ID from request
    const { feedbackId } = req.params;
    const { guideId, notificationDetails } = req.body;

    // Step 2: Find the feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Step 3: Update feedback with guide ID, status, and assignment timestamp
    feedback.guideId = guideId;
    feedback.status = 'assigned';
    feedback.assignedAt = new Date();

    // Step 4: Save the updated feedback
    await feedback.save();

    // Step 5: Return success response
    res.status(200).json({ message: 'Feedback assigned to guide', feedback });
    
    // Step 6: Create a notification for the guide
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
    // Step 7: Handle any errors during the process
    console.error('Error assigning feedback to guide:', error);
    res.status(500).json({ error: 'Failed to assign feedback to guide' });
  }
};

// Retrieve feedback assigned to a guide
exports.getGuideFeedback = async (req, res) => {
  try {
    // Step 1: Get the authenticated guide's ID
    const guideId = req.user.id;

    // Step 2: Fetch feedback assigned to the guide, populating user and trip details
    const feedback = await Feedback.find({ guideId })
      .populate('userId', 'email name')
      .populate('tripId')
      .sort({ createdAt: -1 });

    // Step 3: Return the feedback
    res.status(200).json(feedback);
  } catch (error) {
    // Step 4: Handle any errors during fetching
    console.error('Error fetching guide feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback assigned to you' });
  }
};

// Guide responds to assigned feedback
exports.guideRespondToFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback ID, response, and resolve status from request
    const { feedbackId } = req.params;
    const { guideResponse, resolveStatus } = req.body;
    const guideId = req.user.id;
    
    // Step 2: Find feedback assigned to the guide
    const feedback = await Feedback.findOne({ 
      _id: feedbackId,
      guideId: guideId 
    });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or not assigned to you' });
    }

    // Step 3: Update feedback with guide response
    feedback.guideResponse = guideResponse;

    // Step 4: Update status based on resolveStatus
    if (resolveStatus) {
      feedback.status = 'resolved';
      feedback.resolvedAt = new Date();
    } else {
      feedback.status = 'responded';
    }

    // Step 5: Save the updated feedback
    await feedback.save();
    
    // Step 6: Create a notification for admin
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

    // Step 7: Return success response
    res.status(200).json({ 
      message: 'Response added successfully', 
      feedback 
    });
  } catch (error) {
    // Step 8: Handle any errors during the process
    console.error('Error responding to feedback:', error);
    res.status(500).json({ error: 'Failed to add response to feedback' });
  }
};

// Generate feedback report for admin
exports.getAdminFeedbackReport = async (req, res) => {
  try {
    // Step 1: Aggregate feedback stats by status
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    // Step 2: Fetch all feedback with user and guide details
    const feedbacks = await Feedback.find()
      .populate('userId', 'email name')
      .populate('guideId', 'email name')
      .sort({ createdAt: -1 });
    
    // Step 3: Format the response with stats and feedback details
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
    
    // Step 4: Return the report
    res.status(200).json(response);
  } catch (error) {
    // Step 5: Handle any errors during report generation
    console.error('Error generating feedback report:', error);
    res.status(500).json({ error: 'Failed to generate feedback report' });
  }
};

// Mark feedback as resolved (admin or guide)
exports.resolveFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback ID and resolution note from request
    const { feedbackId } = req.params;
    const { resolveNote } = req.body;

    // Step 2: Build query based on user role
    let query = { _id: feedbackId };
    if (req.user.role === 'guide') {
      query.guideId = req.user.id;
    }

    // Step 3: Find the feedback
    const feedback = await Feedback.findOne(query);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or you are not authorized' });
    }

    // Step 4: Update feedback status and timestamp
    feedback.status = 'resolved';
    feedback.resolvedAt = new Date();
    
    // Step 5: Add resolution note based on user role
    if (req.user.role === 'admin') {
      feedback.adminResponse = resolveNote || feedback.adminResponse;
    } else {
      feedback.guideResponse = resolveNote || feedback.guideResponse;
    }

    // Step 6: Save the updated feedback
    await feedback.save();

    // Step 7: Return success response
    res.status(200).json({
      message: 'Feedback marked as resolved',
      feedback
    });
  } catch (error) {
    // Step 8: Handle any errors during the process
    console.error('Error resolving feedback:', error);
    res.status(500).json({ error: 'Failed to resolve feedback' });
  }
};

// Update user's own feedback
exports.updateUserFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback ID, text, and rating from request
    const { feedbackId } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.id;
    
    // Step 2: Validate input
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Feedback text cannot be empty' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Step 3: Find feedback owned by the user
    const feedback = await Feedback.findOne({ 
      _id: feedbackId,
      userId: userId
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or you are not authorized to edit it' });
    }
    
    // Step 4: Check if feedback is still editable
    if (feedback.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update feedback that has already been responded to or resolved' 
      });
    }
    
    // Step 5: Update feedback details
    feedback.text = text;
    feedback.rating = rating;

    // Step 6: Save the updated feedback
    await feedback.save();
    
    // Step 7: Return success response
    res.status(200).json({ 
      message: 'Feedback updated successfully', 
      feedback 
    });
  } catch (error) {
    // Step 8: Handle any errors during the process
    console.error('Error updating user feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
};

// Delete feedback (admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    // Step 1: Extract feedback ID from request parameters
    const { feedbackId } = req.params;
    
    // Step 2: Validate feedback ID format
    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: 'Invalid feedback ID format' });
    }
    
    // Step 3: Find the feedback by ID
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Step 4: Delete the feedback from the database
    await Feedback.deleteOne({ _id: feedbackId });
    
    // Step 5: Return success response
    return res.status(200).json({ 
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    // Step 6: Handle any errors during deletion
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ 
      error: 'Failed to delete feedback',
      details: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  submitFeedback: exports.submitFeedback,
  getAllFeedback: exports.getAllFeedback,
  getUserFeedback: exports.getUserFeedback,
  respondToFeedback: exports.respondToFeedback,
  assignFeedbackToGuide: exports.assignFeedbackToGuide,
  getGuideFeedback: exports.getGuideFeedback,
  guideRespondToFeedback: exports.guideRespondToFeedback,
  getAdminFeedbackReport: exports.getAdminFeedbackReport,
  resolveFeedback: exports.resolveFeedback,
  updateUserFeedback: exports.updateUserFeedback,
  deleteFeedback: exports.deleteFeedback
};