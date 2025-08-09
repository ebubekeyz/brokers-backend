const Deposit = require('../models/Deposit');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Admin creates deposit for a specific user (via params)
exports.adminCreateDeposit = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Amount is required' });
  }

  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
  }

  const deposit = await Deposit.create({
    user: userId,
    amount,
    status: 'Approved', // Optional: admin deposits can be auto-approved
  });

  res.status(StatusCodes.CREATED).json({ msg: 'Deposit created for user', deposit });
};

// Normal user creates deposit for self
exports.createDeposit = async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Amount is required' });
  }

  const deposit = await Deposit.create({
    user: req.user.userId,
    amount,
  });

  res.status(StatusCodes.CREATED).json({ msg: 'Deposit created successfully', deposit });
};

exports.getUserDeposits = async (req, res) => {
  const deposits = await Deposit.find({ user: req.user.userId }).sort('createdAt');
  res.status(StatusCodes.OK).json({ deposits });
};

exports.getAllDeposits = async (req, res) => {
  const deposits = await Deposit.find()
    .populate('user', 'fullName email')
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ deposits });
};

exports.approveDeposit = async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Deposit not found' });
  }

  deposit.status = 'Approved';
  await deposit.save();

  res.status(StatusCodes.OK).json({ msg: 'Deposit approved', deposit });
};

exports.rejectDeposit = async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Deposit not found' });
  }

  deposit.status = 'Rejected';
  await deposit.save();

  res.status(StatusCodes.OK).json({ msg: 'Deposit rejected', deposit });
};

exports.deleteSingleDeposit = async (req, res) => {
  const { id } = req.params;

  const deposit = await Deposit.findById(id);

  if (!deposit) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Deposit not found' });
  }

  await deposit.deleteOne();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Deposit deleted successfully' });
};




