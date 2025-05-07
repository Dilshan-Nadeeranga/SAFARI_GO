const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, authorizeAdmin, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

// Submit feedback - requires user authentication
router.post('/', authenticateToken, feedbackController.submitFeedback);

// Get all feedback - requires admin access
router.get('/all', authenticateToken, authorizeAdmin, feedbackController.getAllFeedback);

// Get user's feedback - requires user authentication
router.get('/user', authenticateToken, feedbackController.getUserFeedback);

// These specific routes with prefixes need to come BEFORE the generic /:feedbackId route
// Respond to feedback - requires admin access
router.put('/respond/:feedbackId', authenticateToken, authorizeAdmin, (req, res) => {
  // Validation middleware
  if (!req.params.feedbackId || !mongoose.Types.ObjectId.isValid(req.params.feedbackId)) {
    return res.status(400).json({ message: 'Invalid feedback ID format' });
  }
  
  // Call the controller function
  feedbackController.respondToFeedback(req, res);
});

// Assign feedback to a guide - requires admin
router.put('/assign-guide/:feedbackId', authenticateToken, authorizeAdmin, feedbackController.assignFeedbackToGuide);

// Get admin feedback report
router.get('/report', authenticateToken, authorizeAdmin, feedbackController.getAdminFeedbackReport);

// Guide endpoints
router.get('/guide', authenticateToken, authorize(['guide']), feedbackController.getGuideFeedback);
router.put('/guide/respond/:feedbackId', authenticateToken, authorize(['guide']), feedbackController.guideRespondToFeedback);

// Resolve feedback (can be used by both admin and guide)
router.put('/resolve/:feedbackId', authenticateToken, authorize(['admin', 'guide']), feedbackController.resolveFeedback);

// Update user's own feedback - requires user authentication
router.put('/update/:feedbackId', authenticateToken, feedbackController.updateUserFeedback);

// New delete route
router.delete('/:feedbackId', authenticateToken, authorizeAdmin, (req, res) => {
  if (!req.params.feedbackId || !mongoose.Types.ObjectId.isValid(req.params.feedbackId)) {
    return res.status(400).json({ message: 'Invalid feedback ID format' });
  }
  feedbackController.deleteFeedback(req, res);
});

// This generic route MUST come AFTER more specific routes to avoid conflicts
router.put('/:feedbackId', authenticateToken, feedbackController.updateUserFeedback);

module.exports = router;
