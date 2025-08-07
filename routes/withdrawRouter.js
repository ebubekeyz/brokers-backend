

const express = require('express');
const router = express.Router();


const auth = require('../middleware/authentication.js');
const {createWithdraw, getUserWithdraws, getAllWithdraws, updateWithdrawStatus, deleteWithdraw} = require('../controllers/withdrawController');
// User routes
router.post('/', auth, createWithdraw);
router.get('/me', auth, getUserWithdraws);

// Admin routes
router.get('/', auth, getAllWithdraws);
router.patch('/:id', auth, updateWithdrawStatus);
router.delete('/:id', auth, deleteWithdraw);

module.exports = router;