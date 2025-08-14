const Order = require("../models/Order");

// @desc    Get all orders
// @route   GET /orders
exports.getOrders = async (req, res) => {
  try {
    // You can change .sort({ createdAt: -1 }) to .sort({ userId: 1 }) if needed
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json({ data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Create a new order
// @route   POST /orders
exports.createOrder = async (req, res) => {
  try {
    const {
      user,
      userId,
      id,
      amountPaid,
      cryptoCurrency,
      fiatCurrency,
      isBuyOrSell,
      paymentOption,
      conversionPrice,
      cryptoAmount,
      status
    } = req.body;

    // Basic validation
    if (!user || !userId || !id || !amountPaid || !cryptoCurrency || !fiatCurrency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = new Order({
      user,
      userId,
      id,
      amountPaid,
      cryptoCurrency,
      fiatCurrency,
      isBuyOrSell,
      paymentOption,
      conversionPrice,
      cryptoAmount,
      status
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      data: savedOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json({ data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};
