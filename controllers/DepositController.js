const Deposit = require('../models/Deposit');
const { StatusCodes } = require('http-status-codes');

const createDeposit = async (req, res) => {
  const userId = req.user.userId;
  const { investmentType, investmentItem, amount, note } = req.body;

  if (!investmentType || !investmentItem || !amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please fill in all required fields' });
  }

  const deposit = await Deposit.create({
    user: userId,
    investmentType,
    investmentItem,
    amount,
    note,
  });

  res.status(StatusCodes.CREATED).json({ deposit });
};

const getUserDeposits = async (req, res) => {
  const userId = req.user.userId;
  const deposits = await Deposit.find({ user: userId }).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ deposits });
};

const getAllDeposits = async (req, res) => {
  const deposits = await Deposit.find().populate('user', 'name email');
  res.status(StatusCodes.OK).json({ deposits });
};

const approveDeposit = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findById(id);

  if (!deposit) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Deposit not found' });
  }

  deposit.status = 'approved';
  await deposit.save();

  res.status(StatusCodes.OK).json({ msg: 'Deposit approved successfully', deposit });
};

const rejectDeposit = async (req, res) => {
  const { id } = req.params;
  const deposit = await Deposit.findById(id);

  if (!deposit) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Deposit not found' });
  }

  deposit.status = 'rejected';
  await deposit.save();

  res.status(StatusCodes.OK).json({ msg: 'Deposit rejected successfully', deposit });
};

module.exports = {
  createDeposit,
  getUserDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
};
