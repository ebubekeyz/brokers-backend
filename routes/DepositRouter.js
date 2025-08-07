const express = require('express');
const router = express.Router();
const {
  createDeposit,
  getUserDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
} = require('../controllers/DepositController');

const auth = require('../middleware/authentication.js');

router.route('/')
  .post(auth, createDeposit)
  .get(auth, getUserDeposits);

router.route('/admin').get(auth, getAllDeposits);

router.patch('/approve/:id', auth, approveDeposit);
router.patch('/reject/:id', auth, rejectDeposit);

module.exports = router;
