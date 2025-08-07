const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser
} = require('../controllers/authController');
const auth = require('../middleware/authentication.js');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.get('/', auth, getAllUsers); // optionally add admin check
router.delete('/:id', auth, deleteUser);

module.exports = router;
