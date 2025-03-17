const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new customer
exports.registerCustomer = async (req, res) => {
    try {
        const { name, Lname, Gender, Phonenumber1, Phonenumber2, email, password } = req.body;
        const profilePicture = req.file ? req.file.path : ''; // Store profile picture path

        // Check if email is already registered
        let existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new customer
        const newCustomer = new Customer({
            name,
            Lname,
            Gender,
            Phonenumber1,
            Phonenumber2,
            email,
            password: hashedPassword,
            profilePicture
        });

        await newCustomer.save();
        res.status(201).json({ message: 'Customer registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering customer' });
    }
};

// Login customer
exports.loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: customer._id,  // ✅ Correct key name
                name: customer.name,
                email: customer.email,
                profilePicture: customer.profilePicture
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customer details' });
    }
};

// Update customer details
exports.updateCustomer = async (req, res) => {
    try {
        let updateData = req.body;

        if (req.file) {
            updateData.profilePicture = req.file.path; // Update profile picture if new one is uploaded
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting customer' });
    }
};
