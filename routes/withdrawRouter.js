

const express = require('express');
const router = express.Router();


const auth = require('../middleware/authentication.js');
const controller = require('../controllers/withdrawController');

// User creates a withdrawal request
router.post('/', auth, controller.createWithdraw);

// Admin gets all withdrawal requests
router.get('/', auth, controller.getAllWithdraws);

// Admin gets a single withdrawal
router.get('/:id', auth, controller.getWithdrawById);

// Admin approves a withdrawal
router.put('/:id/approve', auth, controller.approveWithdraw);

// Admin rejects a withdrawal
router.put('/:id/reject', auth, controller.rejectWithdraw);

// User gets their own withdrawals
router.get('/user/me', auth, controller.getUserWithdraws);

module.exports = router;
