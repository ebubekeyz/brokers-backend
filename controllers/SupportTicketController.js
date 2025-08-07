const SupportTicket = require('../models/SupportTicket');

// Create a support ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const ticket = new SupportTicket({
      user: req.user._id,
      subject,
      message,
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all tickets (admin) or user’s own tickets
exports.getTickets = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    const tickets = await SupportTicket.find(query).populate('user', 'name email');
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single ticket
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user', 'name email');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin reply to ticket
exports.replyToTicket = async (req, res) => {
  try {
    const { reply, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    ticket.reply = reply || ticket.reply;
    ticket.status = status || ticket.status;

    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a ticket (admin or ticket owner)
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await ticket.remove();
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
