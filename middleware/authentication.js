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
      fullName,
      walletAddress,
      phone,
      kycVerified
 
    } = payload;

    req.user = {
     userId,
      role,
      email,
      fullName,
       walletAddress,
      phone,
      kycVerified
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Authentication Invalid');
  }
};

module.exports = auth;
