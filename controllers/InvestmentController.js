const Investment = require('../models/Investment');
const InvestmentProduct = require('../models/InvestmentProduct');

// Create a new investment
exports.createInvestment = async (req, res) => {
  try {
    const { product, amount, duration } = req.body;

    const investmentProduct = await InvestmentProduct.findById(product);
    if (!investmentProduct) return res.status(404).json({ error: 'Product not found' });

    if (amount < investmentProduct.minAmount || amount > investmentProduct.maxAmount) {
      return res.status(400).json({ error: 'Amount out of product range' });
    }

    if (!investmentProduct.durationOptions.includes(duration)) {
      return res.status(400).json({ error: 'Invalid duration for this product' });
    }

    const profitRate = investmentProduct.profitRate;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000); // Add days

    const investment = await Investment.create({
      user: req.user._id,
      product,
      amount,
      duration,
      profitRate,
      startDate,
      endDate
    });

    res.status(201).json(investment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all investments (admin or user)
exports.getInvestments = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    const investments = await Investment.find(query).populate('product user');
    res.status(200).json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single investment
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('product user');
    if (!investment) return res.status(404).json({ error: 'Investment not found' });

    if (req.user.role !== 'admin' && investment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.status(200).json(investment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update investment status (admin only)
exports.updateInvestmentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!investment) return res.status(404).json({ error: 'Investment not found' });

    res.status(200).json(investment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete investment (admin only)
exports.deleteInvestment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await Investment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Investment not found' });

    res.status(200).json({ message: 'Investment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
