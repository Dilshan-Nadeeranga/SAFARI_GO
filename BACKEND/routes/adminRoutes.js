const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const User = require('../models/User');
const Booking = require('../models/Booking');
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');

const router = express.Router();

// Admin dashboard stats
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    // User stats
    const users = await User.countDocuments({ role: 'user' });
    const guides = await User.countDocuments({ role: 'guide' });
    const vehicleOwners = await User.countDocuments({ role: 'vehicle_owner' });
    
    // Booking stats
    const bookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    // Revenue calculation (assuming bookings have an amount field)
    const completedBookingsList = await Booking.find({ status: 'completed' });
    const revenue = completedBookingsList.reduce((total, booking) => total + (booking.amount || 0), 0);
    
    // Monthly revenue for the last 6 months
    const revenueByMonth = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthlyBookings = await Booking.find({
        status: 'completed',
        date: { 
          $gte: month,
          $lt: nextMonth
        }
      });
      
      const monthlyRevenue = monthlyBookings.reduce((total, booking) => total + (booking.amount || 0), 0);
      revenueByMonth.push(monthlyRevenue);
    }
    
    res.status(200).json({
      users,
      guides,
      vehicleOwners,
      bookings,
      pendingBookings,
      completedBookings,
      revenue,
      revenueByMonth
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
});

// Get vehicle statistics for admin dashboard
router.get('/vehicle-stats', auth, authorize(['admin']), async (req, res) => {
  try {
    // Get counts by status
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const unavailableVehicles = await Vehicle.countDocuments({ status: 'unavailable' });
    const totalVehicles = await Vehicle.countDocuments();
    
    // Count vehicles with missing documents
    const missingLicense = await Vehicle.countDocuments({ licenseDoc: { $exists: false } });
    const missingInsurance = await Vehicle.countDocuments({ insuranceDoc: { $exists: false } });
    
    // Get vehicles grouped by type
    const vehiclesByType = await Vehicle.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      unavailableVehicles,
      missingLicense,
      missingInsurance,
      vehiclesByType
    });
  } catch (error) {
    console.error('Error fetching vehicle statistics:', error);
    res.status(500).json({ error: 'Error fetching vehicle statistics' });
  }
});

module.exports = router;
