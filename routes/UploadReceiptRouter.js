const express = require('express');
const {
  uploadReceipt,
  getReceipts,
    updateReceiptStatus,
    getUserUploadReceipts,
  editUserUploadReceipt
} = require('../controllers/UploadReceiptController');
const auth = require('../middleware/authentication.js');


const router = express.Router();

// User uploads receipt
router.post('/', auth, uploadReceipt);

// Admin views all receipts
router.get('/', auth, getReceipts);

// Admin updates receipt status
// Admin updates receipt status
router.patch('/:id/status', auth, updateReceiptStatus);

// User gets own receipts
router.get('/user', auth, getUserUploadReceipts);

// User edits their own receipt
router.put('/user/:id', auth, editUserUploadReceipt);



module.exports = router;
