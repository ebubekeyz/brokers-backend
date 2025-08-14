const mongoose = require('mongoose');


const ProfitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  investment: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  amount: Number,
  creditedAt: Date
});
module.exports = mongoose.model('Profit', ProfitSchema);