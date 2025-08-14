const Order = require("../models/Order");

// Create a new order (prevents duplicate id for same user)
const createOrder = async (req, res) => {
  try {
    const {
      id,
      amountPaid,
      userId,
      details,
      isBuyOrSell,
      paymentOption,
      conversionPrice,
      cryptoAmount,
      status
    } = req.body;

    // Check if order with same id already exists for this user
    const existingOrder = await Order.findOne({ id, user: req.user.userId });
    if (existingOrder) {
      return res.status(400).json({ msg: "Order with this ID already exists" });
    }

    // Ensure details is a Map
    const detailsMap = details instanceof Map
      ? details
      : new Map(Object.entries(details || {}));

    const order = new Order({
      user: req.user.userId, // from auth middleware
      userId,
      id,
      amountPaid,
      details: detailsMap,
      isBuyOrSell,
      paymentOption,
      conversionPrice,
      cryptoAmount,
      status
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ msg: "Server error creating order" });
  }
};


// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ msg: "Server error fetching orders" });
  }
};

// Get a single order by DB _id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ msg: "Server error fetching order" });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(200).json({ msg: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ msg: "Server error deleting order" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ msg: "Server error fetching all orders" });
  }
};

module.exports = {
    getAllOrders,
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder
};