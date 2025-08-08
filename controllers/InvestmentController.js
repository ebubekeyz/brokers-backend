const Investment = require('../models/Investment');
const { StatusCodes } = require('http-status-codes');

// Create a new investment
const createInvestment = async (req, res) => {
  const userId = req.user.userId;
  const { investmentType, investmentItem, amount, note, profit } = req.body;

  if (!investmentType || !investmentItem || !amount) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Please fill in all required fields' });
  }

  const investment = await Investment.create({
    user: userId,
    investmentType,
    investmentItem,
    amount,
    note,
    profit: profit || 0, // Default to 0 if not provided
  });

  res.status(StatusCodes.CREATED).json({ investment });
};

// Get investments for the logged-in user
const getUserInvestments = async (req, res) => {
  const userId = req.user.userId;
  const investments = await Investment.find({ user: userId }).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ investments });
};

// Get all investments (admin use)
const getAllInvestments = async (req, res) => {
  const investments = await Investment.find().populate('user', 'fullName email');
  res.status(StatusCodes.OK).json({ investments });
};

// Approve an investment by ID
const approveInvestment = async (req, res) => {
  const { id } = req.params;
  const investment = await Investment.findById(id);

  if (!investment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: 'Investment not found' });
  }

  investment.status = 'approved';
  await investment.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Investment approved successfully', investment });
};

// Reject an investment by ID
const rejectInvestment = async (req, res) => {
  const { id } = req.params;
  const investment = await Investment.findById(id);

  if (!investment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: 'Investment not found' });
  }

  investment.status = 'rejected';
  await investment.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Investment rejected successfully', investment });
};

module.exports = {
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  approveInvestment,
  rejectInvestment,
};
