const express = require('express');
const router = express.Router();
const controller = require('../controllers/InvestmentController');
const auth = require('../middleware/authentication.js');

// Create investment
router.post('/', auth, controller.createInvestment);

// Get all investments (admin gets all, users get theirs)
router.get('/', auth, controller.getInvestments);

// Get a specific investment
router.get('/:id', auth, controller.getInvestmentById);

// Update investment status (admin only)
router.patch('/:id/status', auth, controller.updateInvestmentStatus);

// Delete investment (admin only)
router.delete('/:id', auth, controller.deleteInvestment);

module.exports = router;
