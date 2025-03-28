//BACKEND/controllers/ticketController.js

const Ticket = require('../models/Ticket');

// Submit a ticket
exports.submitTicket = async (req, res) => {
    try {
        const { feedbackId, guideId, issueDescription, status } = req.body;

        // Validate required fields
        if (!feedbackId || !guideId || !issueDescription) {
            return res.status(400).json({ message: 'Feedback ID, guide ID, and issue description are required' });
        }

        const newTicket = new Ticket({
            feedbackId,
            guideId,
            issueDescription,
            status: status || 'Assigned', // Default status is 'Assigned' if not provided
        });

        await newTicket.save();
        res.status(201).json({ message: 'Ticket submitted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('feedbackId guideId') // Populate references for feedback and guide
            .exec();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('feedbackId guideId');
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ message: 'Ticket status updated successfully', updatedTicket });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
    try {
        const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

        if (!deletedTicket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
