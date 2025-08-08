const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  editUser,
  resetPassword,
  getSingleUser
} = require('../controllers/authController');
const auth = require('../middleware/authentication.js');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.patch('/reset-password', auth, resetPassword);
router.get('/single/:id', auth, getSingleUser);
router.get('/', auth, getAllUsers); // optionally add admin check
router.delete('/:id', auth, deleteUser);
router.put('/:id', auth, editUser);

module.exports = router;
