//BACKEND/server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const path = require('path');
require("dotenv").config();

const PORT = process.env.PORT || 8070;

// Import directory setup utility
const setupDirectories = require('./utils/setupDirectories');

// Run directory setup before starting the server
setupDirectories();

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads and public directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
});

// Add error handling for MongoDB connection
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB connection success!");
});

// Function to list all registered routes for debugging
function listRoutes() {
  console.log('\n=== REGISTERED ROUTES ===');
  app._router.stack.forEach(function(r) {
    if (r.route && r.route.path) {
      console.log(`${Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',')} ${r.route.path}`);
    } else if (r.name === 'router') {
      r.handle.stack.forEach(function(layer) {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
          console.log(`${methods} ${layer.route.regexp} ${layer.route.path}`);
        }
      });
    }
  });
  console.log('=========================\n');
}



// Routes - make sure they're loaded in the right order
// Load user routes first as they have authentication
const userRoutes = require('./routes/userRoutes');
const guideRoutes = require('./routes/guideRoutes');
const safariRoutes = require('./routes/safariRoutes'); // Add this line
const adminRoutes = require('./routes/adminRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes'); // Add this line
const vehicleRoutes = require('./routes/vehicleRoutes');
const vehicleRentalRoutes = require('./routes/vehicleRentalRoutes'); // Add this import
const aiSafariRoutes = require('./routes/AISafariRoutes');


// Make sure the routes are registered in the correct order
app.use('/users', userRoutes);
console.log('User routes registered');
app.use('/admin', adminRoutes);  // Make sure this is before other routes
console.log('Admin routes registered');
app.use('/admin/users', adminUserRoutes); // Add this line - IMPORTANT: register after admin routes
console.log('Admin user routes registered');

// Add debugging routes for checking Safari model endpoints
app.get('/debug/safaris', async (req, res) => {
  try {
    const Safari = require('./models/Safari');
    const safaris = await Safari.find().lean();
    res.status(200).json({
      count: safaris.length,
      safaris: safaris.map(s => ({
        id: s._id,
        title: s.title
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load other routes after
const bookingRoutes = require('./routes/Booking');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/bookings', bookingRoutes);
console.log('Booking routes registered');
app.use('/vehicles', vehicleRoutes);
console.log('Vehicle routes registered');
app.use('/guides', guideRoutes);
console.log('Guide routes registered');
app.use('/feedback', feedbackRoutes);
console.log('Feedback routes registered');
app.use('/safaris', safariRoutes); // Add this line
console.log('Safari routes registered');
app.use('/vehicle-rentals', vehicleRentalRoutes); // Add this line
console.log('Vehicle rental routes registered');
app.use("/api/ai-safari", aiSafariRoutes); // Add AI Safari endpoint
console.log("AI Safari routes registered");

// Debug: Print all routes after they are registered
console.log("\n=== Checking for premium subscriber routes ===");
app._router.stack.forEach(function(r) {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).map(m => m.toUpperCase()).join(',')} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(layer) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(',');
        console.log(`${methods} ${layer.route.path}`);
        
        // Look for premium subscriber routes specifically
        if (layer.route.path.includes('premium-subscribers') || layer.route.path.includes('premium/subscribers')) {
          console.log(`Found premium subscribers route: ${methods} ${layer.route.path}`);
        }
      }
    });
  }
});
console.log("================================\n");

// Clear all previous delete user endpoints and create fresh ones
// IMPORTANT: Define these routes BEFORE other routes to ensure they're matched first
app.delete('/delete-user/:userId', handleUserDeletion);
app.delete('/delete-user/:id', handleUserDeletion); // Also handle :id parameter for backward compatibility

// Shared user deletion handler function
async function handleUserDeletion(req, res) {
  try {
    const userId = req.params.userId || req.params.id;
    console.log(`[DELETE USER] Request received to delete user: ${userId}`);
    
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[DELETE USER] Authentication failed: Missing or invalid Authorization header');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    
    // Verify user is admin
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`[DELETE USER] Token verified for user ${decoded.id}, role: ${decoded.role}`);
      
      if (decoded.role !== 'admin') {
        console.log(`[DELETE USER] Authorization failed: User ${decoded.id} is not an admin`);
        return res.status(403).json({ message: 'Admin privileges required' });
      }
    } catch (error) {
      console.error('[DELETE USER] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    // Get required models
    const User = require('./models/User');
    const CustomerProfile = require('./models/CustomerProfile');
    const GuideProfile = require('./models/GuideProfile');
    const VehicleOwnerProfile = require('./models/VehicleOwnerProfile');
    const Notification = require('./models/Notification');
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[DELETE USER] User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[DELETE USER] Found user: ${user.email}, role: ${user.role}`);
    
    // Delete role-specific profile data
    if (user.role === 'user') {
      await CustomerProfile.findOneAndDelete({ userId: userId });
    } else if (user.role === 'guide') {
      await GuideProfile.findOneAndDelete({ userId: userId });
    } else if (user.role === 'vehicle_owner') {
      await VehicleOwnerProfile.findOneAndDelete({ userId: userId });
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    // Create notification about deletion
    await new Notification({
      type: 'USER_DELETED',
      message: `User ${user.email} was deleted by admin`,
      details: { deletedUserId: userId, deletedBy: decoded.id }
    }).save();
    
    console.log(`[DELETE USER] User ${userId} (${user.email}) deleted successfully by admin ${decoded.id}`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[DELETE USER] Error in delete user endpoint:', error);
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
}

// Print all routes for debugging
listRoutes();

// Test route to check if server is running
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Debug route to list all registered routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          const path = handler.route.path;
          const basePath = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/');
            
          const fullPath = basePath.replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, '')
            + (path === '/' ? '' : path);
            
          routes.push({
            path: fullPath,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.status(200).json({
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Import error handling middleware
const { errorLogger, errorResponder } = require('./middleware/errorHandlers');

// Add error handling middleware AFTER all routes are registered
app.use(errorLogger);
app.use(errorResponder);

// Update 404 handler for unknown routes to match the error format
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', status: 404 });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({ error: err.message || 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
