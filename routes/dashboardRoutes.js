const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/summary', authorize([roles.ADMIN, roles.ACCOUNTANT, roles.STORE_MANAGER]), dashboardController.summary);

module.exports = router;

