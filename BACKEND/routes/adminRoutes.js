const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const User = require('../models/User');
const Booking = require('../models/Booking');  // Make sure this is added
const CustomerProfile = require('../models/CustomerProfile');
const GuideProfile = require('../models/GuideProfile');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');
const PDFDocument = require('pdfkit');
const Vehicle = require('../models/Vehicle'); // Add this to fix Vehicle model reference

const router = express.Router();

// Admin dashboard stats
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    // User stats
    const users = await User.countDocuments({ role: 'user' });
    const guides = await User.countDocuments({ role: 'guide' });
    const vehicleOwners = await User.countDocuments({ role: 'vehicle_owner' });
    
    // Get premium users count (users with active premium subscriptions)
    const now = new Date();
    const premiumUsers = await User.countDocuments({
      role: 'user',
      isPremium: true,
      premiumUntil: { $gt: now }
    });
    
    // Regular users count (users without premium)
    const regularUsers = users - premiumUsers;
    
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
      premiumUsers,
      regularUsers,
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

// Add a specific endpoint for premium subscribers in admin routes as a backup
router.get('/premium-subscribers', auth, authorize(['admin']), async (req, res) => {
  try {
    const now = new Date();
    
    const subscribers = await User.find({
      role: 'user',
      isPremium: true,
      premiumUntil: { $gt: now }
    }).select('email name premiumPlan premiumUntil discountRate subscriptionHistory');
    
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching premium subscribers from admin route:', error);
    res.status(500).json({ error: 'Error fetching premium subscribers' });
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

// Clean implementation of delete user endpoint
router.delete('/users/:userId', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log('Delete user endpoint called for userId:', req.params.userId);
    
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if attempting to delete an admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    
    // Delete user-specific profile data based on role
    if (user.role === 'user') {
      await CustomerProfile.findOneAndDelete({ userId });
    } else if (user.role === 'guide') {
      await GuideProfile.findOneAndDelete({ userId });
    } else if (user.role === 'vehicle_owner') {
      await VehicleOwnerProfile.findOneAndDelete({ userId });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Create admin notification about user deletion
    const Notification = require('../models/Notification');
    await new Notification({
      type: 'USER_DELETED',
      message: `User ${user.email} has been deleted`,
      details: { deletedUser: user.email },
    }).save();
    
    console.log('User deleted successfully:', userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// Add a test route to help debug
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Admin routes are working' });
});

// Add a simple version of the premium subscribers endpoint without auth for testing
router.get('/premium-subscribers-test', async (req, res) => {
  try {
    res.status(200).json({ message: 'Premium subscribers test endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Test error' });
  }
});

// Add a test route for deletion to verify the endpoints are registered correctly
router.get('/users/test-delete/:userId', auth, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Just check if user exists without deleting
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Delete endpoint is working correctly', 
      userFound: true,
      userId: userId,
      email: user.email
    });
  } catch (error) {
    console.error('Error in test delete route:', error);
    res.status(500).json({ error: 'Error testing delete endpoint' });
  }
});

// Add a premium users PDF report download endpoint
router.get('/premium-users/report', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log('Generating premium users PDF report');
    
    // Get current date for active premium users
    const now = new Date();
    
    // Get all premium users
    const premiumUsers = await User.find({
      isPremium: true,
      premiumUntil: { $gt: now }
    }).sort({ premiumUntil: -1 }).lean();
    
    console.log(`Found ${premiumUsers.length} premium users for report`);
    
    // Create a PDF document
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4'
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=premium-users-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add document title and metadata
    doc.font('Helvetica-Bold')
      .fontSize(18)
      .text('Premium Users Report', { align: 'center' })
      .moveDown();
      
    // Add report generation info
    doc.fontSize(12)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`)
      .text(`Total Premium Users: ${premiumUsers.length}`)
      .moveDown(2);
    
    // Add table headers
    const startY = doc.y;
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text('User Email', 50, startY, { width: 200 })
      .text('Plan', 250, startY, { width: 80 })
      .text('Discount', 330, startY, { width: 80 })
      .text('Expires On', 410, startY, { width: 130 })
      .moveDown();
    
    // Draw a line under headers
    doc.moveTo(50, doc.y)
      .lineTo(540, doc.y)
      .stroke();
    doc.moveDown(0.5);
    
    // Add user data rows
    doc.font('Helvetica');
    
    premiumUsers.forEach((user, i) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
        
        // Add headers on new page
        const headerY = 50;
        doc.font('Helvetica-Bold')
          .text('User Email', 50, headerY, { width: 200 })
          .text('Plan', 250, headerY, { width: 80 })
          .text('Discount', 330, headerY, { width: 80 })
          .text('Expires On', 410, headerY, { width: 130 })
          .moveDown();
        
        doc.moveTo(50, doc.y)
          .lineTo(540, doc.y)
          .stroke();
        doc.moveDown(0.5);
        doc.font('Helvetica');
      }
      
      // Add alternating row background
      if (i % 2 === 1) {
        doc.rect(50, doc.y - 5, 490, 20).fill('#f2f2f2');
        doc.fillColor('#000000');
      }
      
      const rowY = doc.y;
      const expiryDate = new Date(user.premiumUntil).toLocaleDateString();
      const planName = (user.premiumPlan || 'standard').charAt(0).toUpperCase() + (user.premiumPlan || 'standard').slice(1);
      
      doc.text(user.email || 'N/A', 50, rowY, { width: 200 })
        .text(planName, 250, rowY, { width: 80 })
        .text(`${user.discountRate || 0}%`, 330, rowY, { width: 80 })
        .text(expiryDate, 410, rowY, { width: 130 })
        .moveDown();
    });
    
    // Add footer with page number - FIX THE PAGE NUMBERING ISSUE
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      // PDFKit uses 1-based page numbers internally
      const pageNumber = range.start + i + 1;
      
      doc.switchToPage(i);
      doc.fontSize(10)
        .text(
          `Page ${pageNumber} of ${range.count}`, 
          50, 
          doc.page.height - 50, 
          { align: 'center' }
        );
    }
    
    // Finalize PDF
    doc.end();
    console.log('PDF report generated successfully');
  } catch (error) {
    console.error('Error generating premium users PDF report:', error);
    res.status(500).json({ error: 'Failed to generate premium users report' });
  }
});

// Add a bookings PDF report download endpoint
router.get('/bookings/report', auth, authorize(['admin']), async (req, res) => {
  try {
    console.log('Generating all bookings PDF report');
    
    // Get query parameters for filtering
    const { status, startDate, endDate } = req.query;
    console.log('Filter params:', { status, startDate, endDate });
    
    // Build query object
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Include the end date
        query.date.$lt = end;
      }
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    // Get bookings with lean() for better performance
    const bookings = await Booking.find(query)
      .lean()
      .sort({ date: -1 });
    
    console.log(`Found ${bookings.length} bookings for report`);
    
    // Create a PDF document
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
      layout: 'landscape'
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add document title and metadata
    doc.font('Helvetica-Bold')
      .fontSize(18)
      .text('Safari Bookings Report', { align: 'center' })
      .moveDown();
      
    // Add report generation info
    const reportFilters = [];
    if (status && status !== 'all') reportFilters.push(`Status: ${status}`);
    if (startDate) reportFilters.push(`From: ${new Date(startDate).toLocaleDateString()}`);
    if (endDate) reportFilters.push(`To: ${new Date(endDate).toLocaleDateString()}`);
    
    doc.fontSize(12)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`)
      .text(`Total Bookings: ${bookings.length}`)
      .text(reportFilters.length > 0 ? `Filters: ${reportFilters.join(', ')}` : 'All bookings')
      .moveDown(2);
    
    // Add table headers if there are bookings
    if (bookings.length > 0) {
      const startY = doc.y;
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .text('Booking ID', 50, startY, { width: 90 })
        .text('Customer', 140, startY, { width: 110 })
        .text('Safari', 250, startY, { width: 110 })
        .text('Date', 360, startY, { width: 90 })
        .text('People', 450, startY, { width: 40 })
        .text('Amount', 490, startY, { width: 70 })
        .text('Status', 560, startY, { width: 90 })
        .moveDown();
      
      // Draw a line under headers
      doc.moveTo(50, doc.y)
        .lineTo(650, doc.y)
        .stroke();
      doc.moveDown(0.5);
      
      // Add booking data rows
      doc.font('Helvetica');
      
      let totalAmount = 0;
      
      bookings.forEach((booking, i) => {
        // Check if we need a new page
        if (doc.y > 500) {
          doc.addPage();
          
          // Add headers on new page
          const headerY = 50;
          doc.font('Helvetica-Bold')
            .fontSize(10)
            .text('Booking ID', 50, headerY, { width: 90 })
            .text('Customer', 140, headerY, { width: 110 })
            .text('Safari', 250, headerY, { width: 110 })
            .text('Date', 360, headerY, { width: 90 })
            .text('People', 450, headerY, { width: 40 })
            .text('Amount', 490, headerY, { width: 70 })
            .text('Status', 560, headerY, { width: 90 })
            .moveDown();
          
          doc.moveTo(50, doc.y)
            .lineTo(650, doc.y)
            .stroke();
          doc.moveDown(0.5);
          doc.font('Helvetica');
        }
        
        // Add alternating row background
        if (i % 2 === 1) {
          doc.rect(50, doc.y - 5, 600, 20).fill('#f2f2f2');
          doc.fillColor('#000000');
        }
        
        const rowY = doc.y;
        const bookingDate = new Date(booking.date).toLocaleDateString();
        const customerName = booking.Fname 
          ? `${booking.Fname} ${booking.Lname || ''}`
          : 'N/A';
        const safariTitle = booking.safariId ? 'Safari #' + booking.safariId.toString().substring(0, 6) : 'N/A';
        
        // Track total amount
        totalAmount += booking.amount || 0;
        
        doc.fontSize(8)
          .text(booking._id.toString().substring(0, 10) + '...', 50, rowY, { width: 90 })
          .text(customerName, 140, rowY, { width: 110 })
          .text(safariTitle, 250, rowY, { width: 110 })
          .text(bookingDate, 360, rowY, { width: 90 })
          .text(booking.numberOfPeople?.toString() || '1', 450, rowY, { width: 40 })
          .text(`Rs. ${(booking.amount || 0).toLocaleString()}`, 490, rowY, { width: 70 })
          .text(booking.status.charAt(0).toUpperCase() + booking.status.slice(1), 560, rowY, { width: 90 })
          .moveDown();
      });
      
      // Add summary
      doc.moveDown()
        .moveTo(50, doc.y)
        .lineTo(650, doc.y)
        .stroke()
        .moveDown();
      
      doc.font('Helvetica-Bold')
        .text(`Total Revenue: Rs. ${totalAmount.toLocaleString()}`, 450, doc.y);
    } else {
      doc.font('Helvetica')
        .fontSize(12)
        .text('No bookings found matching the selected filters.', { align: 'center' })
        .moveDown();
    }
    
    // Add footer with page number - Fix page numbering
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      // PDFKit uses 0-based page indexes internally
      doc.switchToPage(i);
      doc.fontSize(10)
        .text(
          `Page ${i + 1} of ${range.count}`, 
          50, 
          doc.page.height - 50, 
          { align: 'center' }
        );
    }
    
    // Finalize PDF
    doc.end();
    console.log('Bookings PDF report generated successfully');
  } catch (error) {
    console.error('Error generating bookings PDF report:', error);
    // Send a proper error response to the client
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate bookings report',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
  }
});

// Simple test endpoint for PDF generation
router.get('/test-pdf', auth, authorize(['admin']), (req, res) => {
  try {
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test.pdf');
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add content
    doc.font('Helvetica-Bold')
      .fontSize(25)
      .text('PDF Generation Test', 100, 100);
      
    doc.font('Helvetica')
      .fontSize(12)
      .text('This is a test PDF to verify that PDF generation is working correctly.', 100, 150);
      
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating test PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate test PDF' });
    }
  }
});

module.exports = router;
