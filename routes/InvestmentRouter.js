const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getUserInvestments,
  getAllInvestments,
  approveInvestment,
  rejectInvestment,
} = require('../controllers/InvestmentController');
const auth = require('../middleware/authentication');

router.route('/')
  .post(auth, createInvestment)     // User creates investment
  .get(auth, getAllInvestments);    // Admin gets all investments

router.route('/my-investments')
  .get(auth, getUserInvestments);   // User gets their investments

router.patch('/approve/:id', auth, approveInvestment);
router.patch('/reject/:id', auth, rejectInvestment);

module.exports = router;
