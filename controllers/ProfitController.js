const Profit = require('../models/Profit');

// Create a new profit record
exports.createProfit = async (req, res) => {
  try {
    const profit = await Profit.create({
      user: req.body.user,
      investment: req.body.investment,
      amount: req.body.amount,
      creditedAt: req.body.creditedAt || new Date()
    });
    res.status(201).json(profit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all profits for logged-in user
exports.getMyProfits = async (req, res) => {
  try {
    const profits = await Profit.find({ user: req.user._id }).populate('investment');
    res.status(200).json(profits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get profit by ID (only if it belongs to logged-in user)
exports.getProfitById = async (req, res) => {
  try {
    const profit = await Profit.findOne({ _id: req.params.id, user: req.user._id }).populate('investment');
    if (!profit) return res.status(404).json({ error: 'Profit not found' });
    res.status(200).json(profit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all profits (with user and investment info)
exports.getAllProfits = async (req, res) => {
  try {
    const profits = await Profit.find().populate('user', 'name email').populate('investment');
    res.status(200).json(profits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a profit record
exports.deleteProfit = async (req, res) => {
  try {
    const deleted = await Profit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Profit not found' });
    res.status(200).json({ message: 'Profit deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
