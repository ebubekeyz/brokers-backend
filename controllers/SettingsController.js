const Settings = require('../models/Settings');

// Create or update settings (admin or user-specific)
exports.createOrUpdateSettings = async (req, res) => {
  try {
    const { companyAddress, withdrawalLimit, maintenanceMode, supportEmail } = req.body;

    let query = req.user.role === 'admin' ? { user: null } : { user: req.user._id };
    let settings = await Settings.findOne(query);

    if (settings) {
      settings.companyAddress = companyAddress ?? settings.companyAddress;
      settings.withdrawalLimit = withdrawalLimit ?? settings.withdrawalLimit;
      settings.maintenanceMode = maintenanceMode ?? settings.maintenanceMode;
      settings.supportEmail = supportEmail ?? settings.supportEmail;
    } else {
      settings = new Settings({
        user: req.user.role === 'admin' ? null : req.user._id,
        companyAddress,
        withdrawalLimit,
        maintenanceMode,
        supportEmail
      });
    }

    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get settings (admin sees global, user sees their own if set)
exports.getSettings = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { user: null } : { user: req.user._id };
    const settings = await Settings.findOne(query);

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete settings (admin or user)
exports.deleteSettings = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { user: null } : { user: req.user._id };
    const deleted = await Settings.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ error: 'Settings not found' });

    res.status(200).json({ message: 'Settings deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
