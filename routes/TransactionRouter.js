const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionsController.js');
const auth = require('../middleware/authentication.js');

// User routes
router.post('/', auth, controller.createTransaction);
router.get('/me', auth, controller.getMyTransactions);
router.get('/:id', auth, controller.getTransactionById);

// Admin routes
router.get('/', auth, controller.getAllTransactions);
router.put('/:id/status', auth,  controller.updateTransactionStatus);
router.delete('/:id', auth,  controller.deleteTransaction);

module.exports = router;
