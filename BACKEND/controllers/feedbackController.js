const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    const { title, description, isForAdmin, rating } = req.body;
    const user = await User.findById(req.user.id);
    const feedback = new Feedback({
      userId: req.user.id,
      email: user.email,
      title,
      description,
      isForAdmin: isForAdmin === 'true',
      rating: rating || null,
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting feedback' });
  }
};

// Get all feedbacks for a user
exports.getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
};

// Get a single feedback
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback || feedback.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedback' });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { title, description, rating } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback || feedback.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.title = title || feedback.title;
    feedback.description = description || feedback.description;
    feedback.rating = rating !== undefined ? rating : feedback.rating;
    await feedback.save();
    res.status(200).json({ message: 'Feedback updated successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Error updating feedback' });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback || feedback.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    await feedback.deleteOne();
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting feedback' });
  }
};

// Admin: Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
};

// Admin: Respond to feedback
exports.respondToFeedback = async (req, res) => {
  try {
    const { response, status } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.adminResponse = response || feedback.adminResponse;
    feedback.status = status || feedback.status;
    await feedback.save();
    res.status(200).json({ message: 'Response submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting response' });
  }
};