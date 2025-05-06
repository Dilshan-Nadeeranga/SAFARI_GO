//BACKEND/routes/Booking.js
const router = require('express').Router();
const Booking = require('../models/Booking');
const Safari = require('../models/Safari');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

router.post('/add', auth, authorize(['user']), async (req, res) => {
  try {
    const { safariId, Fname, Lname, Phonenumber1, email, date, numberOfPeople, amount, status } = req.body;
    
    // Check if this safari is already booked for the given date
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));
    
    const existingBooking = await Booking.findOne({
      safariId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      // Only consider confirmed or pending_payment bookings
      status: { $in: ['confirmed', 'pending_payment'] }
    });

    if (existingBooking) {
      return res.status(400).json({ 
        error: 'This safari is already booked for the selected date. Please choose another date.' 
      });
    }
    
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
    
    // If booking status is changed to yet_to_refund, calculate refund and notify admin
    if (req.body.status === 'yet_to_refund' && booking.status !== 'yet_to_refund') {
      const safari = await Safari.findById(booking.safariId);
      
      // Calculate days until trip
      const tripDate = new Date(booking.date);
      const today = new Date();
      const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
      
      console.log(`Calculating refund: Trip date: ${tripDate}, Days until trip: ${daysUntilTrip}`);
      
      // Calculate refund amount based on policy
      let refundPercentage = 0;
      if (daysUntilTrip >= 7) {
        refundPercentage = 100;
        console.log('Applying 100% refund policy (7+ days)');
      } else if (daysUntilTrip >= 4 && daysUntilTrip <= 6) {
        refundPercentage = 50;
        console.log('Applying 50% refund policy (4-6 days)');
      } else {
        console.log('Applying 0% refund policy (0-3 days)');
      }
      
      const refundAmount = (booking.amount * refundPercentage) / 100;
      console.log(`Original amount: ${booking.amount}, Refund percentage: ${refundPercentage}%, Refund amount: ${refundAmount}`);
      
      // Store refund info in booking
      updatedBooking.refundAmount = refundAmount;
      updatedBooking.refundPercentage = refundPercentage;
      updatedBooking.daysUntilTrip = daysUntilTrip;
      await updatedBooking.save();
      
      // Create notification for admin
      const adminNotification = new Notification({
        type: 'BOOKING_CANCELLED',
        message: `Booking #${booking._id.toString().substring(0, 8)} has been cancelled and requires refund processing`,
        details: {
          bookingId: booking._id,
          safariId: booking.safariId,
          safariName: safari ? safari.title : 'Unknown Safari',
          customerName: `${booking.Fname} ${booking.Lname}`,
          amount: booking.amount,
          refundAmount: refundAmount,
          refundPercentage: refundPercentage,
          date: booking.date,
          cancelledDate: new Date()
        },
        recipientRole: 'admin'
      });
      await adminNotification.save();

      // Create notification for the user
      const userNotification = new Notification({
        type: 'BOOKING_CANCELLATION_RECEIVED',
        message: `Your cancellation for ${safari ? safari.title : 'Safari Trip'} has been received`,
        details: {
          bookingId: booking._id,
          safariId: booking.safariId,
          date: booking.date,
          refundAmount: refundAmount,
          refundPercentage: refundPercentage
        },
        recipientId: booking.userId,
        recipientRole: 'user'
      });
      await userNotification.save();
    }
    
    // If admin sets status to refunded, notify the user
    if (req.body.status === 'refunded' && booking.status !== 'refunded' && req.user.role === 'admin') {
      const safari = await Safari.findById(booking.safariId);
      
      console.log(`Processing refund for booking ${booking._id}: Amount: ${booking.refundAmount}`);
      
      // Set the refund processed date
      updatedBooking.refundProcessedDate = new Date();
      await updatedBooking.save();
      
      // Create notification for the user
      const userNotification = new Notification({
        type: 'REFUND_PROCESSED',
        message: `Your refund for ${safari ? safari.title : 'Safari Trip'} has been processed`,
        details: {
          bookingId: booking._id,
          safariId: booking.safariId,
          refundAmount: booking.refundAmount || 0,
          processedDate: new Date()
        },
        recipientId: booking.userId,
        recipientRole: 'user'
      });
      await userNotification.save();
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

// Get a specific booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the user is authorized to view this booking
    // Admin can view all bookings, users can only view their own
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Error fetching booking details' });
  }
});

// Add this new route after existing routes
router.get('/check-availability/:safariId/:date', auth, async (req, res) => {
  try {
    const { safariId, date } = req.params;
    
    // Convert the date string to a Date object
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));
    
    const existingBooking = await Booking.findOne({
      safariId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending_payment'] }
    });
    
    res.json({ isAvailable: !existingBooking });
  } catch (err) {
    console.error('Error checking safari availability:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;