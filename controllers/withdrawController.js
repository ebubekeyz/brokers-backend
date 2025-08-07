const Withdraw = require('../models/Withdraw');

// Create a new withdrawal request
exports.createWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.create({
      user: req.user._id, // assuming authenticated user
      amount: req.body.amount,
      method: req.body.method,
      accountDetails: req.body.accountDetails
    });
    res.status(201).json(withdraw);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all withdrawal requests (admin view)
exports.getAllWithdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate('user', 'name email');
    res.status(200).json(withdraws);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific withdrawal
exports.getWithdrawById = async (req, res) => {
  try {
    const withdraw = await Withdraw.findById(req.params.id)
      .populate('user', 'name email');
    if (!withdraw) return res.status(404).json({ error: 'Withdraw not found' });
    res.status(200).json(withdraw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a withdrawal
exports.approveWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        processedAt: new Date()
      },
      { new: true }
    );
    if (!withdraw) return res.status(404).json({ error: 'Withdraw not found' });
    res.status(200).json(withdraw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject a withdrawal
exports.rejectWithdraw = async (req, res) => {
  try {
    const withdraw = await Withdraw.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        processedAt: new Date()
      },
      { new: true }
    );
    if (!withdraw) return res.status(404).json({ error: 'Withdraw not found' });
    res.status(200).json(withdraw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get withdrawals for a specific user (authenticated user)
exports.getUserWithdraws = async (req, res) => {
  try {
    const userId = req.user._id;
    const withdraws = await Withdraw.find({ user: userId });
    res.status(200).json(withdraws);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
