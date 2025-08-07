const InvestmentProduct = require('../models/InvestmentProduct');

// Create a new investment product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await InvestmentProduct.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all active investment products
exports.getActiveProducts = async (req, res) => {
  try {
    const products = await InvestmentProduct.find({ isActive: true });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await InvestmentProduct.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single product
exports.getProductById = async (req, res) => {
  try {
    const product = await InvestmentProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await InvestmentProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await InvestmentProduct.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
