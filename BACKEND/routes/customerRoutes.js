const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    registerCustomer,
    loginCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './uploads/', 
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Register a new customer (with profile picture upload)
router.post('/register', upload.single('profilePicture'), registerCustomer);

// Login customer
router.post('/login', loginCustomer);

// Get customer by ID
router.get('/:id', getCustomerById);

// Update customer details (with profile picture upload)
router.put('/:id', upload.single('profilePicture'), updateCustomer);

// Delete customer
router.delete('/:id', deleteCustomer);

module.exports = router;
