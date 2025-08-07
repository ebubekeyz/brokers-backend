const express = require('express');
const router = express.Router();
const controller = require('../controllers/ProfitController');
const auth = require('../middleware/authentication.js');

// User routes
router.get('/me', auth, controller.getMyProfits);
router.get('/me/:id', auth, controller.getProfitById);

// Admin routes
router.post('/', auth,controller.createProfit);
router.get('/', auth, controller.getAllProfits);
router.delete('/:id', auth,  controller.deleteProfit);

module.exports = router;
