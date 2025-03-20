//BACKEND/routes/Booking.js
const router = require('express').Router();
const Booking = require('../models/Booking');
const { auth, authorize } = require('../middleware/auth');

router.post('/add', auth, authorize(['user']), async (req, res) => {
  try {
    const { safariId, Fname, Lname, Phonenumber1, email } = req.body;
    const newBooking = new Booking({
      userId: req.user.id,
      safariId,
      Fname,
      Lname,
      Phonenumber1,
      email,
    });
    await newBooking.save();
    res.json('Booking Added');
  } catch (err) {
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
    res.status(200).json({ status: 'Booking Updated', booking: updatedBooking });
  } catch (err) {
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

module.exports = router;