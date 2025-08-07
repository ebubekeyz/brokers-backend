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

    if (!req.files || !req.files.image) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Image file is required' });
    }

    const image = req.files.image;
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      use_filename: true,
      folder: 'trustunion',
    });
    fs.unlinkSync(image.tempFilePath);

    const receipt = await UploadReceipt.create({
      user: user.userId,
      transactionId: generateTransactionId(),
      receiptUrl: result.secure_url,
    });

    const approveUrl = `https://brokers-backend-hbq6.onrender.com/api/upload-receipt/${receipt._id}/approve-view`;
    const cancelUrl = `https://brokers-backend-hbq6.onrender.com/api/upload-receipt/${receipt._id}/cancel-view`;

    await transporter.sendMail({
      from: `"FinancePro" <${user.email}>`,
      to: 'smartconcept.cp@gmail.com',
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

const approveReceiptView = async (req, res) => {
  const { id } = req.params;

  res.send(`
    <html>
      <head>
        <title>Approve Receipt</title>
        <style>
          body { font-family: Arial; text-align: center; margin-top: 100px; }
          .btn { padding: 10px 20px; font-size: 16px; cursor: pointer; }
          .message { font-size: 18px; margin-top: 20px; color: green; }
        </style>
      </head>
      <body>
        <h2>Approve this receipt?</h2>
        <button class="btn" onclick="approve()">Approve</button>
        <p class="message" id="message"></p>

        <script>
          async function approve() {
            await fetch('/api/upload-receipt/${id}/approve', { method: 'PATCH' });
            document.querySelector('.btn').style.display = 'none';
            document.getElementById('message').textContent = '✅ Approved successfully';
          }
        </script>
      </body>
    </html>
  `);
};

const cancelReceiptView = async (req, res) => {
  const { id } = req.params;

  res.send(`
    <html>
      <head>
        <title>Cancel Receipt</title>
        <style>
          body { font-family: Arial; text-align: center; margin-top: 100px; }
          .btn { padding: 10px 20px; font-size: 16px; cursor: pointer; }
          .message { font-size: 18px; margin-top: 20px; color: red; }
        </style>
      </head>
      <body>
        <h2>Cancel this receipt?</h2>
        <button class="btn" onclick="cancel()">Cancel</button>
        <p class="message" id="message"></p>

        <script>
          async function cancel() {
            await fetch('/api/upload-receipt/${id}/delete', { method: 'DELETE' });
            document.querySelector('.btn').style.display = 'none';
            document.getElementById('message').textContent = '❌ Cancelled successfully';
          }
        </script>
      </body>
    </html>
  `);
};

const approveReceiptAction = async (req, res) => {
  const { id } = req.params;
  const receipt = await UploadReceipt.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
  if (!receipt) return res.status(404).json({ msg: 'Receipt not found' });
  res.status(200).json({ msg: 'Receipt approved' });
};

const cancelReceiptAction = async (req, res) => {
  const { id } = req.params;
  const receipt = await UploadReceipt.findByIdAndDelete(id);
  if (!receipt) return res.status(404).json({ msg: 'Receipt not found' });
  res.status(200).json({ msg: 'Receipt cancelled' });
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


module.exports = {
  getReceipts,
  uploadReceipt,
  approveReceiptView,
  cancelReceiptView,
  approveReceiptAction,
  cancelReceiptAction,
};