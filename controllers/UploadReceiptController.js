const UploadReceipt = require('../models/UploadReceipt');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: process.env.GMAIL_PORT,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


// Utility to generate unique transactionId
const generateTransactionId = () => {
  return `tnx${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
};

// Upload Receipt Image and Save
const uploadReceipt = async (req, res) => {
  try {
    const user = req.user;

    if (!req.files || !req.files.image) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Image is required' });
    }

    const image = req.files.image;

    const { amount } = req.body;

    if (!amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Amount is required' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      use_filename: true,
      folder: 'trustunion',
    });

    // Delete temp file
    fs.unlinkSync(image.tempFilePath);

    // Create receipt in DB
    const receipt = await UploadReceipt.create({
      user: user._id,
      transactionId: generateTransactionId(),
      amount,
      receiptUrl: result.secure_url,
    });

    // Send Email to Admin
    const approveUrl = `https://brokers-backend-hbq6.onrender.com/api/upload-receipt/${receipt._id}/approve`;
    const cancelUrl = `https://brokers-backend-hbq6.onrender.com/api/upload-receipt/${receipt._id}/delete`;

    const mailOptions = {
      from: `"FinancePro Uploads" <${user.email}>`,
      to: 'smartconcept.cp@gmail.com',
      subject: 'New Receipt Uploaded - Approve or Reject',
      html: `
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <img src="${result.secure_url}" alt="Receipt" width="300" />
        <p>
          <a href="${approveUrl}" style="padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Approve</a>
          <a href="${cancelUrl}" style="padding:10px 20px;background:#dc3545;color:#fff;text-decoration:none;border-radius:5px;margin-left:10px;">Cancel</a>
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(StatusCodes.CREATED).json({ msg: 'Receipt uploaded successfully', receipt });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Server error', error: error.message });
  }
};
// Get All Receipts
const getReceipts = async (req, res) => {
  const receipts = await UploadReceipt.find().populate('user', 'fullName email');
  res.status(StatusCodes.OK).json(receipts);
};

// Approve Receipt
const approveReceipt = async (req, res) => {
  const { id } = req.params;
  const receipt = await UploadReceipt.findByIdAndUpdate(
    id,
    { status: 'approved' },
    { new: true }
  );
  if (!receipt) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Receipt not found' });
  }
  res.status(StatusCodes.OK).json({ msg: 'Receipt approved', receipt });
};

// Delete Receipt
const deleteReceipt = async (req, res) => {
  const { id } = req.params;
  const receipt = await UploadReceipt.findByIdAndDelete(id);
  if (!receipt) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Receipt not found' });
  }
  res.status(StatusCodes.OK).json({ msg: 'Receipt deleted' });
};

module.exports = {
  uploadReceipt,
  getReceipts,
  approveReceipt,
  deleteReceipt,
};
