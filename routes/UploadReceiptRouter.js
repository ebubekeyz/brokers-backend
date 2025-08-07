const express = require('express');
const router = express.Router();
const {
  uploadReceipt,
  getReceipts,
  approveReceiptAction,
  approveReceiptView,
  cancelReceiptAction,
  cancelReceiptView
} = require('../controllers/UploadReceiptController');

const auth = require('../middleware/authentication');

router.post('/upload', auth, uploadReceipt);
router.get('/', auth, getReceipts);
router.get('/:id/approve-view', approveReceiptView);
router.get('/:id/cancel-view', cancelReceiptView);
router.patch('/:id/approve', approveReceiptAction);
router.delete('/:id/delete', cancelReceiptAction);

module.exports = router;
