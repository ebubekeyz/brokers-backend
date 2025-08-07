const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const auth = require('../middleware/authentication.js');

// Authenticated user
router.get('/me', auth, controller.getMyNotifications);
router.put('/read/:id', auth, controller.markAsRead);
router.put('/read-all', auth, controller.markAllAsRead);
router.delete('/:id', auth, controller.deleteNotification);

// Admin or system
router.post('/', auth, controller.createNotification);
router.get('/', auth,controller.getAllNotifications);

module.exports = router;
