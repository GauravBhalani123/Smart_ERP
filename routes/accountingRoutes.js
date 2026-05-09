const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/ledger', authorize([roles.ADMIN, roles.ACCOUNTANT]), accountingController.listLedger);
router.post('/payment', authorize([roles.ADMIN, roles.ACCOUNTANT]), accountingController.addPayment);
router.post('/receipt', authorize([roles.ADMIN, roles.ACCOUNTANT]), accountingController.addReceipt);
router.get('/profit', authorize([roles.ADMIN, roles.ACCOUNTANT]), accountingController.profitSummary);

module.exports = router;

