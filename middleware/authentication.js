const { UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthorizedError('Authentication Invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const {
      userId,
      role,
      email,
      username,
      lastName,
      firstName,
      country,
      phone,
      accountOwnership,
      typeOfAccount,
      identity,
      occupation,
      address,
      maritalStatus,
      dob,
      password,
      idNumber,
      accountNumber,
      sortCode,
    } = payload;

    req.user = {
      userId,
      role,
      email,
      username,
      lastName,
      firstName,
      country,
      phone,
      accountOwnership,
      typeOfAccount,
      identity,
      occupation,
      address,
      maritalStatus,
      dob,
      password,
      idNumber,
      accountNumber,
      sortCode,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Authentication Invalid');
  }
};

module.exports = auth;
