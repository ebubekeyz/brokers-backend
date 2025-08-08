const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });
    }

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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
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

    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    res.status(StatusCodes.OK).json({ msg: 'User deleted successfully' });
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


module.exports = {
  getSingleUser,
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  editUser,
  resetPassword,
};
