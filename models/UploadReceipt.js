const mongoose = require('mongoose');

const UploadReceiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  receiptUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('UploadReceipt', UploadReceiptSchema);
