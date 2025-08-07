const { UnauthorizedError } = require('../errors');

const authPermission = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new UnauthorizedError('Not Permitted');
    }
    next();
  };
};

module.exports = authPermission;
