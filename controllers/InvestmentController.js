const Investment = require('../models/Investment');
const { StatusCodes } = require('http-status-codes');

const createInvestment = async (req, res) => {
  const userId = req.user.userId;
  const {
    investmentType,
    investmentItem,
    amount,
    note,
    durationType,
    durationValue,
    profit,
  } = req.body;

  if (!investmentType || !investmentItem || !amount || !durationType || !durationValue) {
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
    durationType,
    durationValue,
    profit: profit || 0,
  });

  res.status(StatusCodes.CREATED).json({ investment });
};

const getUserInvestments = async (req, res) => {
  const userId = req.user.userId;
  const investments = await Investment.find({ user: userId });
  res.status(StatusCodes.OK).json({ investments });
};

const getAllInvestments = async (req, res) => {
  const investments = await Investment.find().populate('user', 'name email');
  res.status(StatusCodes.OK).json({ investments });
};

const approveInvestment = async (req, res) => {
  const { id } = req.params;
  const investment = await Investment.findById(id);

  if (!investment) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Investment not found' });
  }

  investment.status = 'approved';
  await investment.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Investment approved successfully', investment });
};

const rejectInvestment = async (req, res) => {
  const { id } = req.params;
  const investment = await Investment.findById(id);

  if (!investment) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Investment not found' });
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
