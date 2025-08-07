const express = require('express');
const router = express.Router();
const {
  createDeposit,
  getUserDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
} = require('../controllers/DepositController');

const authenticateUser = require('../middleware/auth');

router.route('/')
  .post(authenticateUser, createDeposit)
  .get(authenticateUser, getUserDeposits);

router.route('/admin').get(authenticateUser, getAllDeposits);

router.patch('/approve/:id', authenticateUser, approveDeposit);
router.patch('/reject/:id', authenticateUser, rejectDeposit);

module.exports = router;
