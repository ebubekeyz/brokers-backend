const Order = require("../models/Order");

/// Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      id,
      amountPaid,
      details,
      isBuyOrSell,
      paymentOption,
      conversionPrice,
      cryptoAmount,
      status
    } = req.body;

    // Ensure details is a Map
    const detailsMap = details instanceof Map
      ? details
      : new Map(Object.entries(details || {}));

    const order = new Order({
      user: req.user._id, // from auth middleware
      userId: req.user.userId,
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ msg: "Server error fetching orders" });
  }
};

// Get a single order by DB _id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
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
    const order = await Order.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(200).json({ msg: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ msg: "Server error deleting order" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  deleteOrder
};