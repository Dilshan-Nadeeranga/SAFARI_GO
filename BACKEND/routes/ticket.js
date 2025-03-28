//BACKEND/routes/ticket.js

const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');

// Route to submit a ticket
router.post('/submit', TicketController.submitTicket);

// Route to get all tickets
router.get('/', TicketController.getAllTickets);

// Route to update ticket status
router.put('/:id/status', TicketController.updateTicketStatus);

module.exports = router;