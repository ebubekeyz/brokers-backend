const mongoose = require('mongoose');



const KYCSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  idType: String,
  idNumber: String,
  document: String,
  selfie: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: Date,
  reviewedAt: Date
});
const KYC = mongoose.model('KYC', KYCSchema);