const express = require('express');
const router = express.Router();
const { getOrderById, deleteOrder, createOrder, getUserOrders, getAllOrders } = require('../controllers/OrderController');
const auth = require('../middleware/authentication.js');

// Public/Admin route to get ALL orders
router.get("/all", getAllOrders);

router.post("/", auth, createOrder);

router.get("/", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
router.delete("/:id", auth, deleteOrder);

module.exports = router;
