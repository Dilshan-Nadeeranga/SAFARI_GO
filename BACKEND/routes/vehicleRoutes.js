const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { auth, authorize } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const VehicleOwnerProfile = require('../models/VehicleOwnerProfile');
const router = express.Router();

// Configure multer for storing vehicle images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = './uploads/vehicles';
        
        // Create different directories based on file type
        if (file.fieldname === 'licenseDoc' || file.fieldname === 'insuranceDoc') {
            dir = './uploads/documents';
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'licenseDoc' ? 'license-' : 
                       file.fieldname === 'insuranceDoc' ? 'insurance-' : 'vehicle-';
        cb(null, `${prefix}${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

// Configure file filter to accept both images and PDFs
const fileFilter = (req, file, cb) => {
    console.log(`Checking file: ${file.fieldname}, mimetype: ${file.mimetype}`);
    if (file.fieldname === 'vehicleImages' && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else if ((file.fieldname === 'licenseDoc' || file.fieldname === 'insuranceDoc') && 
              (file.mimetype === 'application/pdf')) {
        cb(null, true);
    } else {
        console.warn(`Rejected file: ${file.fieldname}, mimetype: ${file.mimetype}`);
        cb(null, false); // Don't throw error, just skip the file
    }
};

// Update multer configuration
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    }
});

// Define the fields for file uploads
const vehicleUploadFields = [
    { name: 'vehicleImages', maxCount: 5 },
    { name: 'licenseDoc', maxCount: 1 },
    { name: 'insuranceDoc', maxCount: 1 }
];

// Get all vehicles (for the authenticated vehicle owner)
router.get('/', auth, authorize(['vehicle_owner', 'admin']), async (req, res) => {
    try {
        let vehicles;
        
        if (req.user.role === 'admin') {
            vehicles = await Vehicle.find();
        } else {
            // Get vehicles belonging to the current vehicle owner
            const profile = await VehicleOwnerProfile.findOne({ userId: req.user.id });
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            
            vehicles = await Vehicle.find({ ownerId: req.user.id });
        }
        
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Error fetching vehicles' });
    }
});

// Create a new vehicle - updated to handle images
router.post('/', auth, authorize(['vehicle_owner']), (req, res, next) => {
    console.log('Starting vehicle creation process');
    upload.fields(vehicleUploadFields)(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: `File upload error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('Received vehicle creation request with fields:', Object.keys(req.body));
        console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
        
        const { type, licensePlate, capacity, features, ownerName, contactNumber } = req.body;
        
        if (!type || !licensePlate) {
            return res.status(400).json({ error: 'Missing required fields: type and licensePlate are required' });
        }
        
        // Get file paths from uploaded files
        const imagePaths = [];
        if (req.files && req.files.vehicleImages) {
            req.files.vehicleImages.forEach(file => {
                imagePaths.push(file.path);
            });
        }
        console.log('Image paths:', imagePaths);
        
        // Get document paths
        let licenseDocPath = null;
        if (req.files && req.files.licenseDoc && req.files.licenseDoc[0]) {
            licenseDocPath = req.files.licenseDoc[0].path;
        }
        
        let insuranceDocPath = null;
        if (req.files && req.files.insuranceDoc && req.files.insuranceDoc[0]) {
            insuranceDocPath = req.files.insuranceDoc[0].path;
        }
        
        console.log('Document paths:', { licenseDocPath, insuranceDocPath });
        
        // Parse features properly with error handling
        let parsedFeatures = [];
        try {
            if (features) {
                if (typeof features === 'string') {
                    // Try parsing as JSON first
                    try {
                        parsedFeatures = JSON.parse(features);
                    } catch (parseError) {
                        // If JSON parsing fails, try to split by comma
                        parsedFeatures = features.split(',').map(f => f.trim());
                    }
                } else if (Array.isArray(features)) {
                    parsedFeatures = features;
                }
            }
        } catch (error) {
            console.error('Error processing features:', error);
            // Default to empty array if all parsing fails
            parsedFeatures = [];
        }
        
        // Create new vehicle with additional fields
        const newVehicle = new Vehicle({
            ownerId: req.user.id,
            type,
            licensePlate,
            capacity: Number(capacity) || 4,
            features: parsedFeatures,
            status: 'active',
            images: imagePaths,
            ownerName: ownerName || '',
            contactNumber: contactNumber || '',
            licenseDoc: licenseDocPath,
            insuranceDoc: insuranceDocPath
        });
        
        console.log('Attempting to save vehicle:', {
            type: newVehicle.type,
            licensePlate: newVehicle.licensePlate,
            imagesCount: newVehicle.images.length,
            hasLicenseDoc: !!newVehicle.licenseDoc,
            hasInsuranceDoc: !!newVehicle.insuranceDoc
        });
        
        await newVehicle.save();
        
        res.status(201).json({ 
            message: 'Vehicle added successfully', 
            vehicle: newVehicle 
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        
        // More specific error messages
        if (error.code === 11000) {
            return res.status(400).json({ error: 'A vehicle with this license plate already exists.' });
        }
        
        res.status(500).json({ error: 'Error adding vehicle: ' + error.message });
    }
});

// Enhanced public vehicles route with better error handling
router.get('/public', async (req, res) => {
    try {
        console.log('Public vehicles endpoint called');
        
        // Fetch vehicles with status 'active'
        const vehicles = await Vehicle.find({ status: 'active' }).select(
            'type licensePlate capacity features images ownerName contactNumber'
        );
        
        console.log(`Found ${vehicles.length} active vehicles to return`);
        
        // Log sample data if available for debugging
        if (vehicles.length > 0) {
            console.log('Sample vehicle data:', {
                id: vehicles[0]._id,
                type: vehicles[0].type,
                hasImages: vehicles[0].images && vehicles[0].images.length > 0
            });
        } else {
            console.log('No vehicles found to return');
        }
        
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching public vehicles:', error);
        res.status(500).json({ 
            error: 'Error fetching vehicles', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get publicly available single vehicle - add this route after /public and before /:id
router.get('/public/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        // Only return active vehicles for public view
        if (vehicle.status !== 'active') {
            return res.status(404).json({ message: 'Vehicle not available' });
        }
        
        // Return vehicle with limited fields for public display
        res.status(200).json({
            _id: vehicle._id,
            type: vehicle.type,
            licensePlate: vehicle.licensePlate,
            capacity: vehicle.capacity,
            features: vehicle.features,
            images: vehicle.images,
            ownerName: vehicle.ownerName,
            contactNumber: vehicle.contactNumber
        });
    } catch (error) {
        console.error('Error fetching public vehicle details:', error);
        res.status(500).json({ error: 'Error fetching vehicle details' });
    }
});

// Get a specific vehicle
router.get('/:id', auth, authorize(['vehicle_owner', 'admin']), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        // Check if user is authorized to access this vehicle
        if (req.user.role !== 'admin' && vehicle.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this vehicle' });
        }
        
        res.status(200).json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'Error fetching vehicle details' });
    }
});

// Update a vehicle - update to allow admins to edit vehicles
router.put('/:id', auth, authorize(['vehicle_owner', 'admin']), (req, res, next) => {
    upload.fields(vehicleUploadFields)(req, res, (err) => {
        if (err) {
            console.error('Multer error in update:', err);
            return res.status(400).json({ error: `File upload error: ${err.message}` });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { type, licensePlate, capacity, features, status } = req.body;
        
        // Check if vehicle exists
        let vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        // Check permissions - allow admin or owner access
        if (req.user.role !== 'admin' && vehicle.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this vehicle' });
        }
        
        // Fix: Get new image paths if any were uploaded
        const newImagePaths = [];
        if (req.files && req.files.vehicleImages) {
            req.files.vehicleImages.forEach(file => {
                newImagePaths.push(file.path);
            });
        }
        
        // Determine which existing images to keep
        let imagesToKeep = [];
        if (req.body.keepImages) {
            const keepImagesArray = Array.isArray(req.body.keepImages) 
                ? req.body.keepImages 
                : [req.body.keepImages];
            
            imagesToKeep = vehicle.images.filter(img => keepImagesArray.includes(img));
        }
        
        // Get new paths for documents if uploaded
        const licenseDocPath = req.files && req.files.licenseDoc && req.files.licenseDoc[0] ? 
            req.files.licenseDoc[0].path : vehicle.licenseDoc;
        const insuranceDocPath = req.files && req.files.insuranceDoc && req.files.insuranceDoc[0] ? 
            req.files.insuranceDoc[0].path : vehicle.insuranceDoc;
        
        // Parse features properly with error handling
        let parsedFeatures = vehicle.features;
        try {
            if (features) {
                if (typeof features === 'string') {
                    // Try parsing as JSON first
                    try {
                        parsedFeatures = JSON.parse(features);
                    } catch (parseError) {
                        // If JSON parsing fails, try to split by comma
                        parsedFeatures = features.split(',').map(f => f.trim());
                    }
                } else if (Array.isArray(features)) {
                    parsedFeatures = features;
                }
            }
        } catch (error) {
            console.error('Error processing features during update:', error);
            parsedFeatures = vehicle.features; // Keep existing if parsing fails
        }
        
        // Update vehicle with new document data and owner information
        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            {
                type,
                licensePlate,
                capacity: Number(capacity) || vehicle.capacity,
                features: parsedFeatures,
                status: status || vehicle.status,
                ownerName: req.body.ownerName || vehicle.ownerName || '',
                contactNumber: req.body.contactNumber || vehicle.contactNumber || '',
                licenseDoc: licenseDocPath,
                insuranceDoc: insuranceDocPath,
                // Combine kept images with new images
                images: [...imagesToKeep, ...newImagePaths]
            },
            { new: true }
        );
        
        res.status(200).json({ 
            message: 'Vehicle updated successfully',
            vehicle 
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ error: 'A vehicle with this license plate already exists.' });
        }
        
        res.status(500).json({ error: 'Error updating vehicle' });
    }
});

// Update vehicle status (for maintenance)
router.patch('/:id/status', auth, authorize(['vehicle_owner']), async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status
        if (!['active', 'maintenance', 'unavailable'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        // Check if vehicle exists and belongs to this user
        let vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        if (vehicle.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this vehicle' });
        }

        // Check if the vehicle has an active booking
        if (vehicle.currentBookingId && status !== 'active') {
            return res.status(400).json({ 
                error: 'Cannot change status while vehicle has an active booking'
            });
        }
        
        // Update status
        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        res.status(200).json({ 
            message: `Vehicle status updated to ${status}`,
            vehicle 
        });
    } catch (error) {
        console.error('Error updating vehicle status:', error);
        res.status(500).json({ error: 'Error updating vehicle status' });
    }
});

// Delete a vehicle - update to allow admins to delete vehicles
router.delete('/:id', auth, authorize(['vehicle_owner', 'admin']), async (req, res) => {
    try {
        console.log(`Attempting to delete vehicle with ID: ${req.params.id}`);
        
        // Validate if ID is in correct MongoDB format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log(`Invalid vehicle ID format: ${req.params.id}`);
            return res.status(400).json({ message: 'Invalid vehicle ID format' });
        }
        
        // Check if vehicle exists
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            console.log(`Vehicle not found with ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        console.log(`Vehicle found: ${vehicle._id}, owned by: ${vehicle.ownerId}, request by: ${req.user.id}`);
        
        // Check permissions - allow admin or owner access
        if (req.user.role !== 'admin' && vehicle.ownerId.toString() !== req.user.id) {
            console.log(`Authorization failed: ${vehicle.ownerId} vs ${req.user.id}`);
            return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
        }
        
        // Check if vehicle has any active bookings
        if (vehicle.currentBookingId) {
            return res.status(400).json({ 
                error: 'Cannot delete a vehicle that has an active booking'
            });
        }
        
        // Delete vehicle
        const result = await Vehicle.findByIdAndDelete(req.params.id);
        console.log('Delete result:', result);
        
        // Delete associated images
        if (vehicle.images && vehicle.images.length > 0) {
            vehicle.images.forEach(imagePath => {
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`Successfully deleted image: ${imagePath}`);
                } catch (err) {
                    console.warn(`Failed to delete image ${imagePath}:`, err);
                }
            });
        }
        
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error(`Error deleting vehicle ${req.params.id}:`, error);
        res.status(500).json({ error: 'Error deleting vehicle: ' + error.message });
    }
});

module.exports = router;