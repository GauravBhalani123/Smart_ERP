const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', authorize([roles.ADMIN, roles.SALES_STAFF, roles.ACCOUNTANT]), salesController.listSales);
router.post('/', authorize([roles.ADMIN, roles.SALES_STAFF]), salesController.createSale);
router.get('/customer/:customerId/ledger', authorize([roles.ADMIN, roles.ACCOUNTANT]), salesController.customerLedger);

module.exports = router;

