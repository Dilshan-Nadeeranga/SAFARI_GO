//BACKEND/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true },  // Reference to the feedback
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },  // Guide to whom the ticket is assigned
    issueDescription: { type: String, required: true },  // Description of the feedback/issue
    status: { type: String, default: 'Assigned' },  // Ticket status (e.g., Pending, Assigned, Closed)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
