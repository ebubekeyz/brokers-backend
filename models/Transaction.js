const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['deposit', 'withdrawal'] },
  amount: Number,
  status: { type: String, enum: ['pending', 'approved', 'cancelled', 'failed'], default: 'pending' },
  method: String,
  receipt: String
}, { timestamps: true });
const Transaction = mongoose.model('Transaction', TransactionSchema);
