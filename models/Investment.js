
const mongoose = require('mongoose');


const InvestmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentProduct' },
  amount: Number,
  duration: Number,
  profitRate: Number,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  startDate: Date,
  endDate: Date
}, { timestamps: true });
const Investment = mongoose.model('Investment', InvestmentSchema);
