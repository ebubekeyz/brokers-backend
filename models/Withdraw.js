const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  method: {
    type: String,
    enum: ['bank', 'crypto'],
    required: true,
  },
  accountDetails: {
    accountNumber: String,
    bankName: String,
    cryptoType: String,
    walletAddress: String,
  },
  requestedAt: { type: Date, default: Date.now },
  processedAt: Date,
});

module.exports = mongoose.model('Withdraw', WithdrawSchema);
