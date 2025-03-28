//BACKEND/controllers/customersupportmanagerController.js
const bcrypt = require('bcryptjs');
const CustomerSupportManager = require('../models/CustomerSupportManager');

// Create a new support manager
exports.createManager = async (req, res) => {
    try {
        const { username, password, email, role } = req.body;

        // Basic validation
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required' });
        }

        // Check if the username or email already exists in the database
        const existingManager = await CustomerSupportManager.findOne({ $or: [{ username }, { email }] });
        if (existingManager) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        // Hash password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        const newManager = new CustomerSupportManager({
            username,
            password: hashedPassword, // Store the hashed password
            email,
            role: role || 'CustomerSupportManager', // Default role if not provided
        });

        await newManager.save();
        res.status(201).json({ message: 'Support manager created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all support managers
exports.getAllManagers = async (req, res) => {
    try {
        const managers = await CustomerSupportManager.find();
        res.json(managers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a support manager by ID
exports.deleteManager = async (req, res) => {
    try {
        const manager = await CustomerSupportManager.findByIdAndDelete(req.params.id);
        if (!manager) {
            return res.status(404).json({ message: 'Support manager not found' });
        }
        res.json({ message: 'Support manager deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
