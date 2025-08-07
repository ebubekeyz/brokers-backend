const BadRequestError = require('./badRequest');
const UnauthorizedError = require('./unauthorized');
const NotFoundError = require('./not-found');
const CustomAPIError = require('./custom-api');

module.exports = {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  CustomAPIError,
};
