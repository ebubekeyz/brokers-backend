const KYC = require('../models/Kyc');

// Submit new KYC request
exports.submitKYC = async (req, res) => {
  try {
    const existing = await KYC.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ error: 'KYC already submitted' });
    }

    const kyc = await KYC.create({
      user: req.user._id,
      idType: req.body.idType,
      idNumber: req.body.idNumber,
      document: req.body.document,
      selfie: req.body.selfie,
      submittedAt: new Date()
    });

    res.status(201).json(kyc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all KYCs (admin only)
exports.getAllKYCs = async (req, res) => {
  try {
    const kycs = await KYC.find().populate('user', 'name email');
    res.status(200).json(kycs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get KYC by ID (admin or owner)
exports.getKYCById = async (req, res) => {
  try {
    const kyc = await KYC.findById(req.params.id).populate('user', 'name email');
    if (!kyc) return res.status(404).json({ error: 'KYC not found' });

    // Only admin or the user themself can view
    if (req.user.role !== 'admin' && !kyc.user._id.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve KYC (admin only)
exports.approveKYC = async (req, res) => {
  try {
    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', reviewedAt: new Date() },
      { new: true }
    );
    if (!kyc) return res.status(404).json({ error: 'KYC not found' });
    res.status(200).json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject KYC (admin only)
exports.rejectKYC = async (req, res) => {
  try {
    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', reviewedAt: new Date() },
      { new: true }
    );
    if (!kyc) return res.status(404).json({ error: 'KYC not found' });
    res.status(200).json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user's KYC
exports.getMyKYC = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    if (!kyc) return res.status(404).json({ error: 'KYC not found' });
    res.status(200).json(kyc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
