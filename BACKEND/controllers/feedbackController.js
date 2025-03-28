<<<<<<< Updated upstream
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
=======
//BACKEND/controllers/feedbackController.js

const Feedback = require('../models/Feedback');

// Submit feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { customerEmail, rating, comment, safariPackageId, assignedGuideId } = req.body;

        // Validate required fields
        if (!customerEmail || !rating || !comment || !safariPackageId) {
            return res.status(400).json({ message: 'Customer email, rating, comment, and safari package are required' });
        }

        // Rating should be between 1 and 5
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const newFeedback = new Feedback({
            customerEmail,
            rating,
            comment,
            safariPackageId,
            assignedGuideId,  // optional field, can be omitted if not provided
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all feedbacks
exports.getAllFeedbacks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Pagination
        const feedbacks = await Feedback.find()
            .populate('safariPackageId assignedGuideId') // Populate references
            .skip((page - 1) * limit) // Pagination offset
            .limit(Number(limit)); // Limit results per page

        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate('safariPackageId assignedGuideId');
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json({ message: 'Feedback status updated successfully', updatedFeedback });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
>>>>>>> Stashed changes
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
<<<<<<< Updated upstream
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
=======
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);

        if (!deletedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
>>>>>>> Stashed changes
