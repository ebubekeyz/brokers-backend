const mongoose = require('mongoose');


const SettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  companyAddress: String,
  withdrawalLimit: Number,
  maintenanceMode: Boolean,
  supportEmail: String
});
const Settings = mongoose.model('Settings', SettingsSchema);