// Import required dependencies
const router = require('express').Router(); // Express Router for defining API routes
const Booking = require('../models/Booking'); // Mongoose model for bookings
const Safari = require('../models/Safari'); // Mongoose model for safaris
const Notification = require('../models/Notification'); // Mongoose model for notifications
const { auth, authorize } = require('../middleware/auth'); // Authentication and authorization middleware

// Route to create a new booking (POST /add)
// Requires authentication and 'user' role
router.post('/add', auth, authorize(['user']), async (req, res) => {
  try {
    // Destructure booking details from request body
    const { safariId, Fname, Lname, Phonenumber1, email, date, numberOfPeople, amount, status } = req.body;
    
    // Check if the safari is already booked for the given date
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0)); // Start of the booking day
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999)); // End of the booking day
    
    // Query for existing bookings on the same safari and date with 'confirmed' or 'pending_payment' status
    const existingBooking = await Booking.findOne({
      safariId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending_payment'] }
    });

    // If a conflicting booking exists, return an error
    if (existingBooking) {
      return res.status(400).json({ 
        error: 'This safari is already booked for the selected date. Please choose another date.' 
      });
    }
    
    // Create a new booking instance with provided and default values
    const newBooking = new Booking({
      userId: req.user.id, // Set user ID from authenticated user
      safariId,
      Fname,
      Lname,
      Phonenumber1,
      email,
      date,
      numberOfPeople: numberOfPeople || 1, // Default to 1 if not provided
      amount,
      status: status || 'pending_payment' // Default to 'pending_payment' if not provided
    });
    
    // Save the booking to the database
    const savedBooking = await newBooking.save();
    res.json(savedBooking); // Return the saved booking
  } catch (err) {
    // Log and return any errors
    console.error('Error creating booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to get all bookings (GET /)
// Requires authentication and 'admin' role
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    // Fetch all bookings from the database
    const bookings = await Booking.find();
    res.json(bookings); // Return the list of bookings
  } catch (err) {
    // Log and return any errors
    res.status(500).json({ error: err.message });
  }
});

// Route to update a booking (PUT /update/:bookingid)
// Requires authentication and either 'user' (own booking) or 'admin' role
router.put('/update/:bookingid', auth, authorize(['user', 'admin']), async (req, res) => {
  try {
    // Find the booking by ID
    const booking = await Booking.findById(req.params.bookingid);
    
    // Check if booking exists and user is authorized (owns booking or is admin)
    if (!booking || (booking.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update the booking with new data and return the updated document
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.bookingid, req.body, { new: true });
    
    // Handle notifications for confirmed bookings
    if (req.body.status === 'confirmed') {
      // Fetch safari details and populate guide information
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
    
    // Handle cancellation and refund calculation for 'yet_to_refund' status
    if (req.body.status === 'yet_to_refund' && booking.status !== 'yet_to_refund') {
      // Fetch safari details
      const safari = await Safari.findById(booking.safariId);
      
      // Calculate days until the trip
      const tripDate = new Date(booking.date);
      const today = new Date();
      const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
      
      console.log(`Calculating refund: Trip date: ${tripDate}, Days until trip: ${daysUntilTrip}`);
      
      // Determine refund percentage based on cancellation policy
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
      
      // Calculate refund amount
      const refundAmount = (booking.amount * refundPercentage) / 100;
      console.log(`Original amount: ${booking.amount}, Refund percentage: ${refundPercentage}%, Refund amount: ${refundAmount}`);
      
      // Update booking with refund details
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
    
    // Handle refund processing for 'refunded' status (admin only)
    if (req.body.status === 'refunded' && booking.status !== 'refunded' && req.user.role === 'admin') {
      // Fetch safari details
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
    
    // Return the updated booking
    res.status(200).json({ status: 'Booking Updated', booking: updatedBooking });
  } catch (err) {
    // Log and return any errors
    console.error('Error updating booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to delete a booking (DELETE /delete/:bookingid)
// Requires authentication and either 'user' (own booking) or 'admin' role
router.delete('/delete/:bookingid', auth, authorize(['user', 'admin']), async (req, res) => {
  try {
    // Find the booking by ID
    const booking = await Booking.findById(req.params.bookingid);
    
    // Check if booking exists and user is authorized
    if (!booking || (booking.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete the booking
    await Booking.findByIdAndDelete(req.params.bookingid);
    res.status(200).json({ status: 'Booking Deleted' });
  } catch (err) {
    // Log and return any errors
    res.status(500).json({ error: err.message });
  }
});

// Route to get bookings for the authenticated user (GET /mybookings)
// Requires authentication and 'user' role
router.get('/mybookings', auth, authorize(['user']), async (req, res) => {
  try {
    // Fetch bookings for the authenticated user
    const bookings = await Booking.find({ userId: req.user.id });
    res.json(bookings); // Return the user's bookings
  } catch (err) {
    // Log and return any errors
    res.status(500).json({ error: err.message });
  }
});

// Route to get bookings for the authenticated user (GET /user)
// Requires authentication (any role)
router.get('/user', auth, async (req, res) => {
  try {
    // Log the user ID and role for debugging
    console.log(`Fetching bookings for user: ${req.user.id}, role: ${req.user.role}`);
    
    // Fetch bookings for the authenticated user
    const bookings = await Booking.find({ userId: req.user.id });
    res.status(200).json(bookings); // Return the user's bookings
  } catch (error) {
    // Log and return any errors
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Route to get bookings for a vehicle owner (GET /vehicle-owner)
// Requires authentication and 'vehicle_owner' role
router.get('/vehicle-owner', auth, authorize(['vehicle_owner']), async (req, res) => {
  try {
    // Placeholder: Find bookings related to vehicles owned by this user
    // Currently returns an empty array (logic to be implemented)
    const bookings = [];
    res.status(200).json(bookings);
  } catch (error) {
    // Log and return any errors
    console.error('Error fetching vehicle owner bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Route to get a specific booking by ID (GET /:id)
// Requires authentication and authorization (user owns booking or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    // Find the booking by ID
    const booking = await Booking.findById(req.params.id);
    
    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is authorized to view the booking
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.status(200).json(booking); // Return the booking details
  } catch (error) {
    // Log and return any errors
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Error fetching booking details' });
  }
});

// Route to check safari availability for a specific date (GET /check-availability/:safariId/:date)
// Requires authentication
router.get('/check-availability/:safariId/:date', auth, async (req, res) => {
  try {
    // Destructure safari ID and date from URL parameters
    const { safariId, date } = req.params;
    
    // Convert date string to Date object and set time range for the day
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));
    
    // Check for existing bookings on the same safari and date
    const existingBooking = await Booking.findOne({
      safariId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'pending_payment'] }
    });
    
    // Return availability status (true if no conflicting booking)
    res.json({ isAvailable: !existingBooking });
  } catch (err) {
    // Log and return any errors
    console.error('Error checking safari availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export the router for use in the main application
module.exports = router;