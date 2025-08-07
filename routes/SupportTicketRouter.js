const express = require('express');
const router = express.Router();
const controller = require('../controllers/SupportTicketController');
const auth = require('../middleware/authentication.js');


// User creates a ticket
router.post('/', auth, controller.createTicket);

// Get all tickets (admin) or user's tickets
router.get('/', auth, controller.getTickets);

// Get single ticket
router.get('/:id', auth, controller.getTicketById);

// Admin replies to a ticket
router.patch('/:id/reply', auth, controller.replyToTicket);

// Delete ticket
router.delete('/:id', auth, controller.deleteTicket);

module.exports = router;
