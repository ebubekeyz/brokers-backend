const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  investmentType: {
    type: String,
    enum: ['stocks', 'bonds', 'real-estate', 'crypto'],
    required: true,
  },
  investmentItem: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
