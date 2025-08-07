const UploadReceipt = require('../models/UploadReceipt');

// User uploads a receipt
const uploadReceipt = async (req, res) => {
  try {
    const { transactionId, amount, receiptUrl } = req.body;
    const userId = req.user && req.user._id;

    if (!transactionId || !amount || !receiptUrl) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const receipt = await UploadReceipt.create({
      user: userId,
      transactionId,
      amount,
      receiptUrl,
    });

    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Admin: Get all receipts
const getReceipts = async (req, res) => {
  try {
    const receipts = await UploadReceipt.find().populate('user', 'fullName email');
    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch receipts', error: error.message });
  }
};

// Admin: Update status of a receipt
const updateReceiptStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await UploadReceipt.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// ✅ NEW: Get receipts of logged-in user
const getUserUploadReceipts = async (req, res) => {
  try {
    const userId = req.user._id;

    const receipts = await UploadReceipt.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your receipts', error: error.message });
  }
};

// ✅ NEW: User edits their uploaded receipt
const editUserUploadReceipt = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { transactionId, amount, receiptUrl } = req.body;

    const receipt = await UploadReceipt.findOne({ _id: id, user: userId });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found or not yours' });
    }

    receipt.transactionId = transactionId || receipt.transactionId;
    receipt.amount = amount || receipt.amount;
    receipt.receiptUrl = receiptUrl || receipt.receiptUrl;
    receipt.status = 'pending'; // reset to pending on edit

    await receipt.save();

    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update receipt', error: error.message });
  }
};

module.exports = {
  uploadReceipt,
  getReceipts,
  updateReceiptStatus,
  getUserUploadReceipts,
  editUserUploadReceipt,
};
