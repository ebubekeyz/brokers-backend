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
module.exports= mongoose.model('InvestmentProduct', InvestmentProductSchema);