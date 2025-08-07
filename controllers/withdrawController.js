const Withdraw = require('../models/Withdraw');
const { StatusCodes } = require('http-status-codes');

const createWithdraw = async (req, res) => {
  try {
    const { amount, method, accountNumber, bankName, cryptoType, walletAddress } = req.body;

    const accountDetails = method === 'bank'
      ? { accountNumber, bankName }
      : { cryptoType, walletAddress };

    const withdraw = await Withdraw.create({
      user: req.user.userId,
      amount,
      method,
      accountDetails,
    });

    res.status(StatusCodes.CREATED).json({ withdraw });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create withdrawal' });
  }
};

const getAllWithdraws = async (req, res) => {
  const withdraws = await Withdraw.find().populate('user').sort({ requestedAt: -1 });
  res.status(StatusCodes.OK).json({ count: withdraws.length, withdraws });
};

const getUserWithdraws = async (req, res) => {
  const userId = req.user.userId;
  const withdraws = await Withdraw.find({ user: userId }).sort({ requestedAt: -1 });
  res.status(StatusCodes.OK).json({ count: withdraws.length, withdraws });
};

const updateWithdrawStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const withdraw = await Withdraw.findByIdAndUpdate(
    id,
    { status, processedAt: new Date() },
    { new: true }
  );

  if (!withdraw) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'Withdrawal not found' });
  }

  res.status(StatusCodes.OK).json({ withdraw });
};

const deleteWithdraw = async (req, res) => {
  const { id } = req.params;

  const withdraw = await Withdraw.findByIdAndDelete(id);

  if (!withdraw) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: 'Withdrawal not found' });
  }

  res.status(StatusCodes.OK).json({ msg: 'Withdrawal deleted' });
};

module.exports = {
  createWithdraw,
  getAllWithdraws,
  getUserWithdraws,
  updateWithdrawStatus,
  deleteWithdraw,
};
