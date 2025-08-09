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
  const withdraws = await Withdraw.find().populate('user', 'fullName email').sort({ requestedAt: -1 });
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




const editWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, accountNumber, bankName, cryptoType, walletAddress } = req.body;

    // Explicitly build accountDetails object
    let accountDetails = {};
    if (method === 'bank') {
      accountDetails = {
        accountNumber: accountNumber || '',
        bankName: bankName || ''
      };
    } else if (method === 'crypto') {
      accountDetails = {
        cryptoType: cryptoType || '',
        walletAddress: walletAddress || ''
      };
    }

    const updatedWithdraw = await Withdraw.findByIdAndUpdate(
      id,
      {
        $set: {
          amount,
          method,
          accountDetails,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true } // runValidators ensures schema rules are respected
    );

    if (!updatedWithdraw) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Withdrawal not found' });
    }

    res.status(StatusCodes.OK).json({ withdraw: updatedWithdraw });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
};

const deleteSingleWithdraw = async (req, res) => {
  const { id } = req.params;

  const withdraw = await Withdraw.findById(id);

  if (!withdraw) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Withdrawal ID not found' });
  }

  await withdraw.deleteOne();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Withdrawal deleted successfully' });
};


// Approve a withdrawal
const approveWithdraw = async (req, res) => {
  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Withdrawal not found' });
  }

  withdraw.status = 'approved';
  withdraw.processedAt = new Date();
  await withdraw.save();

  res.status(StatusCodes.OK).json({ msg: 'Withdrawal approved', withdraw });
};

// Reject a withdrawal
const rejectWithdraw = async (req, res) => {
  const withdraw = await Withdraw.findById(req.params.id);
  if (!withdraw) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Withdrawal not found' });
  }

  withdraw.status = 'rejected';
  withdraw.processedAt = new Date();
  await withdraw.save();

  res.status(StatusCodes.OK).json({ msg: 'Withdrawal rejected', withdraw });
};


const getSingleWithdraw = async (req, res) => {
  try {
    const { id } = req.params;

    // Find withdrawal by ID and populate user details
    const withdraw = await Withdraw.findById(id)
      .populate('user', 'name email') // Get user name and email
      .select('user amount status method accountDetails requestedAt processedAt createdAt updatedAt');

    if (!withdraw) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: 'Withdrawal not found' });
    }

    res.status(StatusCodes.OK).json({ withdraw });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Server error' });
  }
};

module.exports = {
  getSingleWithdraw,
  rejectWithdraw,
  approveWithdraw,
  createWithdraw,
  getAllWithdraws,
  getUserWithdraws,
  updateWithdrawStatus,
  deleteWithdraw,
  editWithdraw,
  deleteSingleWithdraw
};
