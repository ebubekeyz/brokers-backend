const mongoose = require('mongoose');


const InvestmentProductSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['crypto', 'stock', 'bond', 'real estate'] },
  minAmount: Number,
  maxAmount: Number,
  durationOptions: [Number],
  profitRate: Number,
  isActive: { type: Boolean, default: true },
  description: String
});
const InvestmentProduct = mongoose.model('InvestmentProduct', InvestmentProductSchema);