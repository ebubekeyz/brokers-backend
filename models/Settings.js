// models/Setting.js
const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  currency: { type: String, default: "USD" },
},{ timestamps: true });

module.exports = mongoose.model("Setting", SettingSchema);