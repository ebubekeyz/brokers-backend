const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose
    .connect(url)
    .then(() => console.log('CONNECTED TO DB'))
    .catch((error) => console.log(error));
};

module.exports = connectDB;
