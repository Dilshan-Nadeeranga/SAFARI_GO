const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createFeedback,
  getUserFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getAllFeedbacks,
  respondToFeedback,
} = require('../controllers/feedbackController');

// User routes
router.post('/', auth, authorize(['user']), createFeedback);
router.get('/', auth, authorize(['user']), getUserFeedbacks);
router.get('/:id', auth, authorize(['user']), getFeedback);
router.put('/:id', auth, authorize(['user']), updateFeedback);
router.delete('/:id', auth, authorize(['user']), deleteFeedback);

// Admin routes
router.get('/admin/all', auth, authorize(['admin']), getAllFeedbacks);
router.put('/admin/:id', auth, authorize(['admin']), respondToFeedback);

module.exports = router;