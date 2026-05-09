const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', authorize([roles.ADMIN, roles.STORE_MANAGER, roles.ACCOUNTANT]), purchaseController.listPurchases);
router.post('/', authorize([roles.ADMIN, roles.STORE_MANAGER]), purchaseController.createPurchase);
router.get('/vendor/:vendorId/ledger', authorize([roles.ADMIN, roles.ACCOUNTANT]), purchaseController.vendorLedger);

module.exports = router;

