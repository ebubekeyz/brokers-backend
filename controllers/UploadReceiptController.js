const UploadReceipt = require('../models/UploadReceipt');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');


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

const uploadReceipt = async (req, res) => {
  try {
    const user = req.user;

    // Check for uploaded image
    if (!req.files || !req.files.image) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Image file is required' });
    }

    const image = req.files.image;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      use_filename: true,
      folder: 'trustunion',
    });

    fs.unlinkSync(image.tempFilePath);

    // Save receipt to DB
    const receipt = await UploadReceipt.create({
      user: user._id,
      transactionId: generateTransactionId(),
      receiptUrl: result.secure_url,
    });

    // Email links
    const approveUrl = `https://yourdomain.com/api/upload-receipt/${receipt._id}/approve`;
    const cancelUrl = `https://yourdomain.com/api/upload-receipt/${receipt._id}/delete`;

    await transporter.sendMail({
      from: `"FinancePro" <${user.email}>`,
      to: 'smartconcept.cp@gmail.com',
      subject: 'New Receipt Uploaded',
      html: `
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
        <img src="${result.secure_url}" width="300"/>
        <p>
          <a href="${approveUrl}" style="background:#28a745;color:#fff;padding:10px 20px;text-decoration:none;">Approve</a>
          <a href="${cancelUrl}" style="background:#dc3545;color:#fff;padding:10px 20px;text-decoration:none;margin-left:10px;">Cancel</a>
        </p>
      `,
    });

    res.status(StatusCodes.CREATED).json({ msg: 'Receipt uploaded successfully', receipt });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Upload failed', error: error.message });
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
