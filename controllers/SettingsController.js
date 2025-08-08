const Setting = require("../models/Setting");

// GET single settings
const getSettings = async (req, res) => {
  const settings = await Setting.findOne();
  res.status(200).json({ settings });
};

// PATCH update settings
const updateSettings = async (req, res) => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    settings.set(req.body);
    await settings.save();
  }

  res.status(200).json({ msg: "Settings updated successfully", settings });
};

module.exports = {
  getSettings,
  updateSettings,
};
