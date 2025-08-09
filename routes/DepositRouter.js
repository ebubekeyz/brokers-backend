const express = require('express');
const router = express.Router();

const {
  createDeposit,
  adminCreateDeposit,
  getUserDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  deleteSingleDeposit,
  getSingleDeposit
} = require('../controllers/DepositController');

const auth = require('../middleware/authentication');

// User deposit
router.post('/', auth, createDeposit);

// Admin creates deposit for a user using userId from params
router.post('/admin/:userId', auth, adminCreateDeposit);

// Logged-in user gets their own deposits
router.get('/', auth, getUserDeposits);



// Admin gets all deposits
router.get('/admin', auth, getAllDeposits);


router.route('/:id')
  .get(auth, getSingleDeposit);   // User get single their deposit

// Admin approves/rejects deposit
router.patch('/approve/:id', auth, approveDeposit);
router.patch('/reject/:id', auth, rejectDeposit);
router.delete('/delete/:id', auth, deleteSingleDeposit);


module.exports = router;
