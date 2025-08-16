
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: String, required: true },
  id: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  details: { type: Map, of: String }, // <- stores map-like data
  isBuyOrSell: { type: String, enum: ["BUY", "SELL"], required: true },
  paymentOption: { type: String },
  walletAddress: { type: String },
  conversionPrice: { type: Number, required: true },
  cryptoAmount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "COMPLETED"], required: true },
}, { timestamps: true });

module.exports  = mongoose.model("Order", OrderSchema);

