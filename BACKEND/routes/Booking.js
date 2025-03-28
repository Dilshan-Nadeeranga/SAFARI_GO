//BACKEND/routes/Booking.js
const router = require('express').Router();
const Booking = require('../models/Booking');
const Safari = require('../models/Safari');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

router.post('/add', auth, authorize(['user']), async (req, res) => {
  try {
    const { safariId, Fname, Lname, Phonenumber1, email, date, numberOfPeople, amount, status } = req.body;
    const newBooking = new Booking({
      userId: req.user.id,
      safariId,
      Fname,
      Lname,
      Phonenumber1,
      email,
      date,
      numberOfPeople: numberOfPeople || 1,
      amount,
      status: status || 'pending_payment'
    });
    const savedBooking = await newBooking.save();
    res.json(savedBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update/:bookingid', auth, authorize(['user', 'admin']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingid);
    if (!booking || (booking.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.bookingid, req.body, { new: true });
    
    // If booking is confirmed (payment completed), send notifications
    if (req.body.status === 'confirmed') {
      // Get safari details to include guide information and safari details
      const safari = await Safari.findById(booking.safariId).populate('guideId', 'name');
      
      if (safari && safari.guideId) {
        const bookingDate = new Date(booking.date).toLocaleDateString();
        const formattedAmount = booking.amount.toLocaleString();
        
        // Create notification for the guide
        const guideNotification = new Notification({
          type: 'NEW_BOOKING',
          message: `New booking received for your safari "${safari.title}" on ${bookingDate}`,
          details: {
            bookingId: booking._id,
            safariId: safari._id,
            date: booking.date,
            numberOfPeople: booking.numberOfPeople,
            amount: booking.amount
          },
          recipientId: safari.guideId._id,
          recipientRole: 'guide'
        });
        await guideNotification.save();
        
        // Create notification for the user
        const userNotification = new Notification({
          type: 'BOOKING_CONFIRMED',
          message: `Your booking for "${safari.title}" on ${bookingDate} has been confirmed`,
          details: {
            bookingId: booking._id,
            safariId: safari._id,
            date: booking.date,
            numberOfPeople: booking.numberOfPeople,
            amount: booking.amount
          },
          recipientId: booking.userId,
          recipientRole: 'user'
        });
        await userNotification.save();
      }
    }
    
    res.status(200).json({ status: 'Booking Updated', booking: updatedBooking });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/delete/:bookingid', auth, authorize(['user', 'admin']), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingid);
    if (!booking || (booking.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Booking.findByIdAndDelete(req.params.bookingid);
    res.status(200).json({ status: 'Booking Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mybookings', auth, authorize(['user']), async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for the current user - allow any authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    console.log(`Fetching bookings for user: ${req.user.id}, role: ${req.user.role}`);
    const bookings = await Booking.find({ userId: req.user.id });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Get bookings for a vehicle owner
router.get('/vehicle-owner', auth, authorize(['vehicle_owner']), async (req, res) => {
  try {
    // Find bookings related to vehicles owned by this user
    // For simplicity, returning an empty array as placeholder
    const bookings = [];
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching vehicle owner bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

module.exports = router;