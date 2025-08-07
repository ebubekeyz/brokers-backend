const express = require('express');
const router = express.Router();
const {
  uploadReceipt,
  getReceipts,
  approveReceipt,
  deleteReceipt,
} = require('../controllers/UploadReceiptController');

const auth = require('../middleware/authentication');

router.post('/upload', auth, uploadReceipt);
router.get('/', auth, getReceipts);
router.get('/:id/approve', approveReceipt);
router.get('/:id/delete', deleteReceipt);

module.exports = router;
