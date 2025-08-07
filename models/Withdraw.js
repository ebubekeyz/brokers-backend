const mongoose = require('mongoose');


// --- WITHDRAW MODEL ---
const WithdrawSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  method: String,
  accountDetails: String,
  requestedAt: { type: Date, default: Date.now },
  processedAt: Date
});
const Withdraw = mongoose.model('Withdraw', WithdrawSchema);