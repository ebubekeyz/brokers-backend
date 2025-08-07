const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// Register new user
const register = async (req, res) => {
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
};

// Login existing user
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new BadRequestError('Email and password required');

  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthenticatedError('Invalid credentials');

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
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
};

// Get current user (requires auth)
const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.status(StatusCodes.OK).json({ user });
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
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

  // Filter only fields in schema
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

  // Sorting
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  } else if (sort === 'oldest') {
    result = result.sort('createdAt');
  } else if (sort === 'a-z') {
    result = result.sort('fullName');
  } else if (sort === 'z-a') {
    result = result.sort('-fullName');
  }

  // Pagination
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
};



const deleteUser = async (req, res) => {
 const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
  }

  await User.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
};


const editUser = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
  }

  res.status(StatusCodes.OK).json({ user: updatedUser });
};

// ✅ Reset password
const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Old and new password are required');
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new UnauthenticatedError('Old password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({ message: 'Password reset successful' });
};



module.exports = {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  editUser,
  resetPassword
};
