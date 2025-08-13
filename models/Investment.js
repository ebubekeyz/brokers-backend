const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investmentType: {
      type: String,
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
    profit: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    durationType: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    durationValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', InvestmentSchema);
