const UploadReceipt = require('../models/UploadReceipt');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

let originUrl =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5173/api/approve'
        : 'https://brokers-real.netlify.app/approve';
    
    let originUrl2 =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5173/api/delete'
    : 'https://brokers-real.netlify.app/delete';

    
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

    if (!req.files || !req.files.image) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Image file is required' });
    }

    const image = req.files.image;
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      use_filename: true,
      folder: 'barickgold',
    });
    fs.unlinkSync(image.tempFilePath);




    const receipt = await UploadReceipt.create({
      user: user.userId,
      transactionId: generateTransactionId(),
      receiptUrl: result.secure_url,
    });

   
    const approveUrl = `https://brokers-real.netlify.app/approve/${receipt._id}`;
    const cancelUrl = `https://brokers-real.netlify.app/delete/${receipt._id}`;


    // console.log(approveUrl, cancelUrl)

    await transporter.sendMail({
      from: `"Barick Gold Receipt Upload" <support@barrickgold.com>`,
      to: 'ebubeofforjoseph@gmail.com',
      subject: 'New Receipt Uploaded',
      html: `
        <p><strong>User:</strong> ${user.fullName} (${user.email})</p>
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

const getReceipts = async (req, res) => {
  try {
    const receipts = await UploadReceipt.find().populate('user', 'fullName email');
    res.status(StatusCodes.OK).json({ receipts });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Failed to fetch receipts' });
  }
};


const approveReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await UploadReceipt.findById(id);
    if (!receipt) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Receipt not found' });
    }

    receipt.status = 'approved';
    await receipt.save();

    res.status(StatusCodes.OK).json({ msg: 'Receipt approved successfully', receipt });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Approval failed', error: error.message });
  }
};

// Delete/Cancel a receipt
const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await UploadReceipt.findById(id);
    if (!receipt) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Receipt not found' });
    }

    await UploadReceipt.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({ msg: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Delete failed', error: error.message });
  }
};


module.exports = {
  getReceipts,
  uploadReceipt,
  approveReceipt,
  deleteReceipt
 
};