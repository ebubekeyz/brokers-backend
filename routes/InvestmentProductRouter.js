const express = require('express');
const router = express.Router();
const controller = require('../controllers/InvestmentProductController');
const auth = require('../middleware/authentication.js');

// Public: get all active investment products
router.get('/active', controller.getActiveProducts);

// Authenticated: get all (admin), or single product
router.get('/', auth, controller.getAllProducts);
router.get('/:id', auth, controller.getProductById);

// Admin-only: create, update, delete
router.post('/', auth, controller.createProduct);
router.put('/:id', auth,  controller.updateProduct);
router.delete('/:id', auth,  controller.deleteProduct);

module.exports = router;

