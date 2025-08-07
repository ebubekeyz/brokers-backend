const express = require('express');
const router = express.Router();
const controller = require('../controllers/KycController');


const auth = require('../middleware/authentication.js');

// User submits KYC
router.post('/', auth, controller.submitKYC);

// Admin gets all KYC submissions
router.get('/', auth, controller.getAllKYCs);

// Admin or owner gets KYC by ID
router.get('/:id', auth, controller.getKYCById);

// Admin approves KYC
router.put('/:id/approve', auth,controller.approveKYC);

// Admin rejects KYC
router.put('/:id/reject', auth, controller.rejectKYC);

// User gets their own KYC
router.get('/user/me', auth, controller.getMyKYC);

module.exports = router;
