//BACKEND/routes/customerSupportManager.js

const express = require('express');
const router = express.Router();
const CustomerSupportManagerController = require('../controllers/customersupportmanagerController');

// Route to create a new support manager
router.post('/create', CustomerSupportManagerController.createManager);

// Route to get all support managers
router.get('/', CustomerSupportManagerController.getAllManagers);

// Route to delete a support manager by ID
router.delete('/:id', CustomerSupportManagerController.deleteManager);

module.exports = router;