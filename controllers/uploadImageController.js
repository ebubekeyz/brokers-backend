const path = require('path');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const { BadRequestError } = require('../errors');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

// Setup Nodemailer Transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: process.env.GMAIL_PORT,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const upload = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError('No file uploaded');
  }

  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: 'trustunion',
    }
  );

  // Delete temp file
  fs.unlinkSync(req.files.image.tempFilePath);

  // Get user info (assumes authentication middleware adds req.user)
  const user = req.user;

  // Generate Confirm Payment Link (replace with actual route)
  const confirmPaymentUrl = `https://brokers-backend-hbq6.onrender.com/api/upload-receipt/${user.userId}`;

  // Send email with image link + confirm button
  const mailOptions = {
    from: `"FinancePro Uploads" <${user.email}>`,
    to: 'smartconcept.cp@gmail.com',
    subject: 'New Image Uploaded - Payment Proof',
    html: `
      <p><strong>User:</strong> ${user.name} (${user.email})</p>
      <p>A new payment proof has been uploaded:</p>
      <p><a href="${result.secure_url}">${result.secure_url}</a></p>
      <img src="${result.secure_url}" alt="Uploaded Image" width="300" />
      <br/>
      <p>
        <a href="${confirmPaymentUrl}" style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;margin-top:10px;">
          Confirm Payment
        </a>
      </p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Image uploaded but failed to send email.' });
  }

  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = upload;
