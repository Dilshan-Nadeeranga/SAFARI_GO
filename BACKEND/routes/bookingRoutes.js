const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');
const { calculateDiscount } = require('../controllers/discountController');

// Create a new booking
router.post('/add', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingData = req.body;
    
    // Apply premium discount if applicable
    const user = await User.findById(userId);
    const isPremiumActive = user.isPremium && user.premiumUntil > new Date();
    
    if (isPremiumActive) {
      const discountResult = await calculateDiscount(userId, bookingData.amount);
      bookingData.originalAmount = bookingData.amount;
      bookingData.discountAmount = discountResult.discountAmount;
      bookingData.amount = discountResult.finalPrice;
      bookingData.discountApplied = true;
      bookingData.discountRate = discountResult.discountRate;
    }
    
    // Create booking with user's ID
    const booking = await bookingController.createBooking({
      ...bookingData,
      userId
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// ...existing routes...

module.exports = router;
