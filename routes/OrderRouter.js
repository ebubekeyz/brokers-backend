const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getUserOrders } = require('../controllers/OrderController');
const auth = require('../middleware/authentication.js');


// GET /orders
router.get("/", auth, getOrders);


// POST /orders - Create a new order
router.post("/", createOrder);

router.get("/user/:userId", auth, getUserOrders); // GET orders for a specific user

module.exports = router;
