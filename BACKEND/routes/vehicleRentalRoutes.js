const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const VehicleRental = require('../models/VehicleRental');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

// Create a new vehicle rental
router.post('/add', auth, authorize(['user']), async (req, res) => {
  try {
    const {
      vehicleId,
      Fname,
      Lname,
      Phonenumber1,
      email,
      startDate,
      endDate,
      purpose,
      driverNeeded,
      amount,
      status
    } = req.body;

    // Validate required fields
    if (!vehicleId || !startDate || !endDate || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if vehicle is available (status is 'active')
    if (vehicle.status !== 'active') {
      return res.status(400).json({ error: 'Vehicle is not currently available for rental' });
    }

    // Check if vehicle is already booked during the requested period
    const overlappingRentals = await VehicleRental.find({
      vehicleId,
      status: { $in: ['confirmed', 'pending_payment'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlappingRentals.length > 0) {
      return res.status(400).json({ error: 'Vehicle is already booked during this period' });
    }

    // Create the rental
    const newRental = new VehicleRental({
      userId: req.user.id,
      vehicleId,
      Fname,
      Lname,
      Phonenumber1,
      email,
      startDate,
      endDate,
      purpose: purpose || '',
      driverNeeded: driverNeeded || false,
      amount,
      status: status || 'pending_payment'
    });

    const savedRental = await newRental.save();

    // Create notification for vehicle owner
    const ownerNotification = new Notification({
      type: 'NEW_VEHICLE_RENTAL',
      message: `New rental request for your vehicle ${vehicle.type} (${vehicle.licensePlate})`,
      details: {
        rentalId: savedRental._id,
        vehicleId: vehicle._id,
        dates: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      },
      recipientId: vehicle.ownerId,
      recipientRole: 'vehicle_owner'
    });
    await ownerNotification.save();

    // Create notification for the user
    const userNotification = new Notification({
      type: 'RENTAL_CREATED',
      message: `Your rental request for ${vehicle.type} has been created`,
      details: {
        rentalId: savedRental._id,
        vehicleId: vehicle._id,
        status: savedRental.status
      },
      recipientId: req.user.id,
      recipientRole: 'user'
    });
    await userNotification.save();

    res.status(201).json(savedRental);
  } catch (error) {
    console.error('Error creating vehicle rental:', error);
    res.status(500).json({ error: 'Failed to create rental' });
  }
});

// Get all rentals (admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const rentals = await VehicleRental.find().sort({ createdAt: -1 });
    res.status(200).json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get user's rentals
router.get('/user', auth, authorize(['user']), async (req, res) => {
  try {
    const rentals = await VehicleRental.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(rentals);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    res.status(500).json({ error: 'Failed to fetch your rentals' });
  }
});

// Get vehicle owner's rentals
router.get('/owner', auth, authorize(['vehicle_owner']), async (req, res) => {
  try {
    // Find all vehicles owned by this user
    const vehicles = await Vehicle.find({ ownerId: req.user.id });
    const vehicleIds = vehicles.map(vehicle => vehicle._id);

    // Find rentals for these vehicles
    const rentals = await VehicleRental.find({ 
      vehicleId: { $in: vehicleIds } 
    }).sort({ createdAt: -1 });

    res.status(200).json(rentals);
  } catch (error) {
    console.error('Error fetching owner rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get specific rental by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const rental = await VehicleRental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check permission - only the renter, vehicle owner, or admin can see details
    if (req.user.role !== 'admin') {
      // If user is the renter
      const isRenter = rental.userId.toString() === req.user.id;
      
      // If user is the vehicle owner
      let isOwner = false;
      if (req.user.role === 'vehicle_owner') {
        const vehicle = await Vehicle.findById(rental.vehicleId);
        if (vehicle && vehicle.ownerId.toString() === req.user.id) {
          isOwner = true;
        }
      }

      if (!isRenter && !isOwner) {
        return res.status(403).json({ error: 'Not authorized to view this rental' });
      }
    }

    res.status(200).json(rental);
  } catch (error) {
    console.error('Error fetching rental details:', error);
    res.status(500).json({ error: 'Failed to fetch rental details' });
  }
});

// Update rental status
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { status, paymentId, paymentDetails } = req.body;
    const rental = await VehicleRental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isVehicleOwner = req.user.role === 'vehicle_owner';
    const isRenter = rental.userId.toString() === req.user.id;

    if (!isAdmin && !isRenter && !isVehicleOwner) {
      return res.status(403).json({ error: 'Not authorized to update this rental' });
    }

    // If changing to confirmed status, add payment details
    if (status === 'confirmed') {
      rental.paymentId = paymentId || rental.paymentId;
      rental.paymentDetails = paymentDetails || rental.paymentDetails;
    }

    // Update status
    rental.status = status;
    rental.updatedAt = Date.now();
    const updatedRental = await rental.save();

    // If rental is confirmed, update the vehicle's current booking ID
    if (status === 'confirmed') {
      await Vehicle.findByIdAndUpdate(rental.vehicleId, {
        currentBookingId: rental._id
      });

      // Create notification for the vehicle owner
      const vehicle = await Vehicle.findById(rental.vehicleId);
      if (vehicle) {
        const ownerNotification = new Notification({
          type: 'RENTAL_CONFIRMED',
          message: `Payment confirmed for your vehicle ${vehicle.type} (${vehicle.licensePlate})`,
          details: {
            rentalId: rental._id,
            vehicleId: vehicle._id,
            dates: `${new Date(rental.startDate).toLocaleDateString()} - ${new Date(rental.endDate).toLocaleDateString()}`
          },
          recipientId: vehicle.ownerId,
          recipientRole: 'vehicle_owner'
        });
        await ownerNotification.save();
      }

      // Create notification for the user
      const userNotification = new Notification({
        type: 'RENTAL_CONFIRMED',
        message: `Your vehicle rental has been confirmed`,
        details: {
          rentalId: rental._id,
          vehicleId: rental.vehicleId,
          dates: `${new Date(rental.startDate).toLocaleDateString()} - ${new Date(rental.endDate).toLocaleDateString()}`
        },
        recipientId: rental.userId,
        recipientRole: 'user'
      });
      await userNotification.save();
    }

    // If rental is completed or cancelled, clear the vehicle's current booking ID
    if (status === 'completed' || status === 'cancelled') {
      const vehicle = await Vehicle.findById(rental.vehicleId);
      if (vehicle && vehicle.currentBookingId && vehicle.currentBookingId.toString() === rental._id.toString()) {
        await Vehicle.findByIdAndUpdate(rental.vehicleId, {
          currentBookingId: null
        });
      }
    }

    res.status(200).json(updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    res.status(500).json({ error: 'Failed to update rental' });
  }
});

module.exports = router;
