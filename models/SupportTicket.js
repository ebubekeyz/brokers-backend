const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: String,
  message: String,
  status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
  reply: String
}, { timestamps: true });
module.exports = mongoose.model('SupportTicket', SupportTicketSchema);