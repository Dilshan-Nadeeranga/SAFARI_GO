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

// Improve CORS configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Important: bodyParser must come before route handlers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.use('/users', userRoutes);
console.log('User routes registered');

// Load other routes after
const bookingRoutes = require('./routes/Booking');
const vehicleRoutes = require('./routes/vehicleRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/bookings', bookingRoutes);
console.log('Booking routes registered');
app.use('/admin', adminRoutes);
console.log('Admin routes registered');
app.use('/vehicles', vehicleRoutes);
console.log('Vehicle routes registered');
app.use('/guides', guideRoutes);
console.log('Guide routes registered');
app.use('/feedback', feedbackRoutes);
console.log('Feedback routes registered');
app.use('/safaris', safariRoutes); // Add this line
console.log('Safari routes registered');

// Print all routes for debugging
listRoutes();

// Test route to check if server is running
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Add 404 handler for unknown routes
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({ error: err.message || 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
