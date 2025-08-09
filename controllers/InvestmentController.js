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
  const investments = await Investment.find({ user: userId }).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ investments });
};

const getAllInvestments = async (req, res) => {
  const investments = await Investment.find().populate('user', 'fullName email');
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


const deleteSingleInvestment = async (req, res) => {
  const { id } = req.params;

  const investment = await Investment.findById(id);

  if (!investment) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Investment not found' });
  }

  await investment.deleteOne();

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Investment deleted successfully' });
};

const getSingleInvestment = async (req, res) => {
  const { id } = req.params;

  try {
    const investment = await Investment.findById(id).populate('user', 'fullName email');

    if (!investment) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Investment not found' });
    }

    res.status(StatusCodes.OK).json({ investment });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Invalid investment ID' });
  }
};

// Edit investment
const editInvestment = async (req, res) => {
  const { id } = req.params;
  const {
    investmentType,
    investmentItem,
    amount,
    note,
    durationType,
    durationValue,
    profit,
    status
  } = req.body;

  try {
    const investment = await Investment.findById(id);

    if (!investment) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Investment not found' });
    }

    investment.investmentType = investmentType ?? investment.investmentType;
    investment.investmentItem = investmentItem ?? investment.investmentItem;
    investment.amount = amount ?? investment.amount;
    investment.note = note ?? investment.note;
    investment.durationType = durationType ?? investment.durationType;
    investment.durationValue = durationValue ?? investment.durationValue;
    investment.profit = profit ?? investment.profit;
    investment.status = status ?? investment.status;

    await investment.save();

    res.status(StatusCodes.OK).json({ msg: 'Investment updated successfully', investment });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Invalid investment ID' });
  }
};



const adminCreateInvestment = async (req, res) => {
  const { userId } = req.params;
  const {
    investmentType,
    investmentItem,
    amount,
    note,
    durationType,
    durationValue,
  } = req.body;

  // Validate required fields (matching your form inputs)
  if (
    !investmentType ||
    !investmentItem ||
    amount === undefined ||
    !durationType ||
    durationValue === undefined
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg:
        "investmentType, investmentItem, amount, durationType, and durationValue are required",
    });
  }

  // Validate enums as per form options
  const validInvestmentTypes = ["stocks", "bonds", "real-estate", "crypto"];
  const validDurationTypes = ["monthly", "yearly"];

  if (!validInvestmentTypes.includes(investmentType)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid investmentType" });
  }

  if (!validDurationTypes.includes(durationType)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid durationType" });
  }

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  // Create investment - admin-created investments are auto-approved
  try {
    const investment = await Investment.create({
      user: userId,
      investmentType,
      investmentItem,
      amount,
      profit: 0, // profit not part of form, set default 0
      note: note || "",
      status: "approved",
      durationType,
      durationValue,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Investment created for user", investment });
  } catch (error) {
    console.error("Error creating investment:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to create investment",
      error: error.message,
    });
  }
};

module.exports = {
  editInvestment,
  getSingleInvestment,
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  approveInvestment,
  rejectInvestment,
  deleteSingleInvestment,
  adminCreateInvestment
};
