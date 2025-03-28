//BACKEND/routes/feedback.js

const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/feedbackController');

// Route to submit feedback
router.post('/submit', FeedbackController.submitFeedback);

// Route to get all feedbacks
router.get('/', FeedbackController.getAllFeedbacks);

// Route to update feedback status
router.put('/:id/status', FeedbackController.updateFeedbackStatus);

module.exports = router;