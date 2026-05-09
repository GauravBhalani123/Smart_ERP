const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', authorize([roles.ADMIN, roles.ACCOUNTANT, roles.STORE_MANAGER]), notificationController.listNotifications);

module.exports = router;

