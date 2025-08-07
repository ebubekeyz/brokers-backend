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

// Upload Receipt Image and Save
const uploadReceipt = async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'No image uploaded' });
  }

  const { transactionId, amount } = req.body;
  if (!transactionId || !amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Transaction ID and amount are required' });
  }

  const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
    use_filename: true,
    folder: 'trustunion',
  });

  fs.unlinkSync(req.files.image.tempFilePath);

  const receipt = await UploadReceipt.create({
    user: req.user._id,
    transactionId,
    amount,
    receiptUrl: result.secure_url,
  });

  // Confirm/Cancel URLs
  const approveUrl = `https://yourdomain.com/api/upload-receipt/${receipt._id}/approve`;
  const cancelUrl = `https://yourdomain.com/api/upload-receipt/${receipt._id}/delete`;

  const mailOptions = {
    from: `"FinancePro Uploads" <${req.user.email}>`,
    to: 'smartconcept.cp@gmail.com',
    subject: 'New Receipt Uploaded - Approve or Reject',
    html: `
      <p><strong>User:</strong> ${req.user.name} (${req.user.email})</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Amount:</strong> ${amount}</p>
      <p><img src="${result.secure_url}" width="300"/></p>
      <p>
        <a href="${approveUrl}" style="padding:10px 20px;background:#28a745;color:#fff;text-decoration:none;border-radius:5px;">Approve</a>
        <a href="${cancelUrl}" style="padding:10px 20px;background:#dc3545;color:#fff;text-decoration:none;border-radius:5px;margin-left:10px;">Cancel</a>
      </p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
  }

  res.status(StatusCodes.CREATED).json({ receipt });
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
