

const express = require('express');
const router = express.Router();


const auth = require('../middleware/authentication.js');
const {createWithdraw, getUserWithdraws, getAllWithdraws, updateWithdrawStatus, deleteWithdraw, editWithdraw, deleteSingleWithdraw, approveWithdraw, rejectWithdraw, getSingleWithdraw} = require('../controllers/withdrawController');
// User routes
router.post('/', auth, createWithdraw);
router.get('/me', auth, getUserWithdraws);

// Admin routes
router.get('/', auth, getAllWithdraws);

router.route('/:id').get(auth, getSingleWithdraw);   // User get single their withdraw

router.patch('/:id', auth, updateWithdrawStatus);
router.delete('/:id', auth, deleteWithdraw);
router.patch('/:id', auth, editWithdraw);
router.delete('/delete/:id', auth, deleteSingleWithdraw);
router.patch('/approve/:id', auth, approveWithdraw);
router.patch('/reject/:id', auth, rejectWithdraw);

module.exports = router;