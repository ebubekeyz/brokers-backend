const express = require('express');
const router = express.Router();

const {
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  approveInvestment,
  rejectInvestment,
} = require('../controllers/InvestmentController');

const auth = require('../middleware/authentication.js');

router.route('/')
  .post(auth, createInvestment)
  .get(auth, getUserInvestments);

router.route('/admin').get(auth, getAllInvestments);

router.patch('/approve/:id', auth, approveInvestment);
router.patch('/reject/:id', auth, rejectInvestment);

module.exports = router;
