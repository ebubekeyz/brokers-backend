const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const nodemailer = require('nodemailer');

const Deposit = require('../models/Deposit');
const Investment = require('../models/Investment');
const Withdraw =  require('../models/Withdraw');
const Order =  require('../models/Order');

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: process.env.GMAIL_PORT,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});






// const getAccountBalance = async (req, res) => {
//   const userId = req.user.userId; // Assuming authentication middleware sets this

//   try {
//     // Get all successful deposits
//     const deposits = await Deposit.find({ user: userId, status: "approved" });
//     const totalFunded = deposits.reduce((acc, curr) => acc + curr.amount, 0);

//     // Get all investments
//     const investments = await Investment.find({ user: userId });
//     const totalInvested = investments.reduce((acc, curr) => acc + curr.amount, 0);
//     const totalProfit = investments.reduce((acc, curr) => acc + (curr.profit || 0), 0);

//     // Get all approved withdrawals
//     const withdraw = await Withdraw.find({ user: userId, status: "approved" });
//     const totalWithdrawn = withdraw.reduce((acc, curr) => acc + curr.amount, 0);

//     // Get all orders and sum amountPaid
//     const orders = await Order.find({ userId }); // or { user: userId } if linked to ObjectId
//     const totalOrdersPaid = orders.reduce((acc, curr) => acc + curr.amountPaid, 0);

//     // Calculate balance
//     const balance = (totalFunded + totalProfit + totalOrdersPaid) - (totalInvested + totalWithdrawn);

//     // Calculate Profit/Loss and Percentage Change
//     const profitLoss = totalProfit; 
//     const pctChange = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

//     res.status(200).json({
//       totalFunded,
//       totalInvested,
//       totalProfit,
//       totalWithdrawn,
//       totalOrdersPaid,
//       balance,
//       profitLoss,
//       pctChange: parseFloat(pctChange.toFixed(2)),
//     });

//   } catch (error) {
//     console.error("Balance error", error);
//     res.status(500).json({ msg: "Server error while calculating balance" });
//   }
// };

const getAccountBalance = async (req, res) => {
  const userId = req.user.userId; // Assuming authentication middleware sets this

  try {
    // Get all successful deposits
    const deposits = await Deposit.find({ user: userId, status: "approved" });
    const totalFunded = deposits.reduce((acc, curr) => acc + curr.amount, 0);

    // Get all investments
    const investments = await Investment.find({ user: userId });
    const totalInvested = investments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalProfit = investments.reduce((acc, curr) => acc + (curr.profit || 0), 0);

    // Get all approved withdrawals
    const withdraw = await Withdraw.find({ user: userId, status: "approved" });
    const totalWithdrawn = withdraw.reduce((acc, curr) => acc + curr.amount, 0);

    // Get BUY orders and sum amountPaid
    const buyOrders = await Order.find({ user: userId, isBuyOrSell: "BUY" });
    const totalBuyOrders = buyOrders.reduce((acc, curr) => acc + curr.amountPaid, 0);

    console.log()

    // Get SELL orders and sum amountPaid
    const sellOrders = await Order.find({ user: userId, isBuyOrSell: "SELL" });
    const totalSellOrders = sellOrders.reduce((acc, curr) => acc + curr.amountPaid, 0);

    // Calculate balance
    const balance =
      (totalFunded + totalProfit + totalSellOrders) -
      (totalInvested + totalWithdrawn + totalBuyOrders);

    // Calculate Profit/Loss and Percentage Change
    const profitLoss = totalProfit;
    const pctChange = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    res.status(200).json({
      totalFunded,
      totalInvested,
      totalProfit,
      totalWithdrawn,
      totalBuyOrders,
      totalSellOrders,
      balance,
      profitLoss,
      pctChange: parseFloat(pctChange.toFixed(2)),
    });

  } catch (error) {
    console.error("Balance error", error);
    res.status(500).json({ msg: "Server error while calculating balance" });
  }
};


// Register new user
const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountBalance: user.accountBalance,
        kycVerified: user.kycVerified,
      },
      token,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};

// Login existing user
const login = async (req, res) => {
  try {
    const { email, password, otpCode } = req.body;

    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });
    }

    // STEP 1: If password is sent, we are in "request OTP" mode
    if (password && !otpCode) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ msg: "Invalid credentials" });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      user.twoFactorCode = generatedOtp;
      user.twoFactorCodeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save();

      await transporter.sendMail({
        from: `"Barick Gold" <support@barickgold.com>`,
        to: user.email,
        subject: "Your 2FA Login Code",
        text: `Your login code is: ${generatedOtp}. It expires in 5 minutes.`,
      });

      return res.status(StatusCodes.OK).json({
        msg: "OTP sent to your email. Please verify to complete login.",
      });
    }

    // STEP 2: If OTP is sent, we verify it and log in
    if (otpCode && !password) {
      if (
        user.twoFactorCode !== otpCode ||
        Date.now() > user.twoFactorCodeExpires
      ) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ msg: "Invalid or expired OTP code" });
      }

      user.twoFactorCode = undefined;
      user.twoFactorCodeExpires = undefined;
      await user.save();

      const token = user.createJWT();

      return res.status(StatusCodes.OK).json({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          accountBalance: user.accountBalance,
          kycVerified: user.kycVerified,
        },
        token,
      });
    }

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid request format" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};
// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    let {
      sort,
      fullName,
      email,
      kycVerified,
      accountBalance,
      date,
      page = 1,
      limit = 100,
    } = req.query;

    const queryObject = {};

    if (fullName) {
      queryObject.fullName = { $regex: fullName, $options: 'i' };
    }
    if (email) {
      queryObject.email = { $regex: email, $options: 'i' };
    }
    if (kycVerified === 'true' || kycVerified === 'false') {
      queryObject.kycVerified = kycVerified === 'true';
    }
    if (accountBalance) {
      queryObject.accountBalance = Number(accountBalance);
    }
    if (date) {
      const isoDate = new Date(date);
      const nextDay = new Date(isoDate);
      nextDay.setDate(isoDate.getDate() + 1);
      queryObject.createdAt = {
        $gte: isoDate,
        $lt: nextDay,
      };
    }

    let result = User.find(queryObject).select('-password');

    if (sort === 'latest') result = result.sort('-createdAt');
    else if (sort === 'oldest') result = result.sort('createdAt');
    else if (sort === 'a-z') result = result.sort('fullName');
    else if (sort === 'z-a') result = result.sort('-fullName');

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    const users = await result;
    const totalUsers = await User.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalUsers / limit);

    res.status(StatusCodes.OK).json({
      users,
      meta: {
        pagination: {
          page,
          total: totalUsers,
          pageCount: numOfPages,
        },
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    // Delete all related Withdraw, Investment, and Deposit records
    await Promise.all([
      Withdraw.deleteMany({ user: id }),
      Investment.deleteMany({ user: id }),
      Deposit.deleteMany({ user: id })
    ]);

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({ msg: 'User and all related records deleted successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};


// Edit user
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    // Apply accountBalance logic
    user.accountBalance = req.body.accountBalance ?? user.accountBalance;

    // Apply other fields (if you want to allow update of other fields dynamically)
    for (const key in updateFields) {
      if (key !== 'accountBalance' && updateFields[key] !== undefined) {
        user[key] = updateFields[key];
      }
    }

    const updatedUser = await user.save();

    res.status(StatusCodes.OK).json({ user: updatedUser });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Old and new password are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Old password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Password reset successful' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};


const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};



const getAdminStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // Sum of all transaction amounts
    const depositsTotal = await Deposit.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const withdrawalsTotal = await Withdraw.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const investmentsTotal = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const depositsAmount = depositsTotal[0]?.total || 0;
    const withdrawalsAmount = withdrawalsTotal[0]?.total || 0;
    const investmentsAmount = investmentsTotal[0]?.total || 0;

    const totalTransactions =
      depositsAmount + withdrawalsAmount + investmentsAmount;

    // Pending approvals from all three collections
    const pendingDeposits = await Deposit.countDocuments({ status: "pending" });
    const pendingWithdrawals = await Withdraw.countDocuments({ status: "pending" });
    const pendingInvestments = await Investment.countDocuments({ status: "pending" });

    const pendingApprovals =
      pendingDeposits + pendingWithdrawals + pendingInvestments;

    // Calculate analytics percentages
    const depositsPercent = totalTransactions
      ? (depositsAmount / totalTransactions) * 100
      : 0;
    const withdrawalsPercent = totalTransactions
      ? (withdrawalsAmount / totalTransactions) * 100
      : 0;
    const investmentsPercent = totalTransactions
      ? (investmentsAmount / totalTransactions) * 100
      : 0;

    // Sum of all percentages
    const analyticsTotalPercent = (
      depositsPercent +
      withdrawalsPercent +
      investmentsPercent
    ).toFixed(2);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        pendingApprovals,
        analytics: analyticsTotalPercent
      }
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const getTransactionStatusStats = async (req, res) => {
  try {
    // Helper to get counts by status
    const getStatusCounts = async (Model) => {
      const [approved, pending, rejected] = await Promise.all([
        Model.countDocuments({ status: "approved" }),
        Model.countDocuments({ status: "pending" }),
        Model.countDocuments({ status: "rejected" }),
      ]);
      return { approved, pending, rejected };
    };

    // Helper to get the most recent transaction with user's full name and amount
    const getRecentTransaction = async (Model) => {
      const recent = await Model.findOne({})
        .sort({ createdAt: -1 })
        .populate("user", "fullName") // assuming the `user` field is a ref to User model
        .select("amount user");

      return recent
        ? {
            fullName: recent.user?.fullName || "Unknown User",
            amount: recent.amount,
          }
        : null;
    };

    const [
      depositStats,
      withdrawalStats,
      investmentStats,
      recentDeposit,
      recentWithdrawal,
      recentInvestment,
    ] = await Promise.all([
      getStatusCounts(Deposit),
      getStatusCounts(Withdraw),
      getStatusCounts(Investment),
      getRecentTransaction(Deposit),
      getRecentTransaction(Withdraw),
      getRecentTransaction(Investment),
    ]);

    res.json({
      success: true,
      data: {
        deposits: depositStats,
        withdraw: withdrawalStats,
        investments: investmentStats,
        recent: {
          deposit: recentDeposit,
          withdrawal: recentWithdrawal,
          investment: recentInvestment,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transaction status stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getTransactionStatusStats,
  getAdminStats,
   getAccountBalance,
  getSingleUser,
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  editUser,
  resetPassword,
};
