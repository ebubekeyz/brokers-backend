const express = require('express');
const router = express.Router();
const controller = require('../controllers/SettingsController');
const auth = require('../middleware/authentication.js');

// Authenticated routes
router.post('/', auth, controller.createOrUpdateSettings);
router.get('/', auth, controller.getSettings);
router.delete('/', auth, controller.deleteSettings);

module.exports = router;
