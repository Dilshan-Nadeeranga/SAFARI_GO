//BACKEND/models/CustomerSupportManager.js
const mongoose = require('mongoose');

const CustomerSupportManagerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },  
    password: { type: String, required: true },  // Admin password (you can hash it before storing)
    email: { type: String, required: true, unique: true },  
    role: { type: String, default: 'FastenerSupportManager' },  
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomerSupportManager', CustomerSupportManagerSchema);
