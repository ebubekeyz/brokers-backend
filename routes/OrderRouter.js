const express = require('express');
const router = express.Router();
const { getOrderById, deleteOrder, deleteAllOrders, createOrder, getUserOrders, getAllOrders } = require('../controllers/OrderController');
const auth = require('../middleware/authentication.js');

// Public/Admin route to get ALL orders
router.get("/all", getAllOrders);

router.post("/", auth, createOrder);

router.delete("/", auth, deleteAllOrders);

router.get("/", auth, getUserOrders);
router.get("/:id", auth, getOrderById);
router.delete("/:id", auth, deleteOrder);

module.exports = router;
