const path = require('path');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const { BadRequestError } = require('../errors');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');


const upload = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError('No file uploaded');
  }

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: 'barickgold',
    }
  );

  // Delete temp file
  fs.unlinkSync(req.files.image.tempFilePath);


  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = upload;
