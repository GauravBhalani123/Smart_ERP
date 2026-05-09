const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/invoice/:id/pdf', authorize([roles.ADMIN, roles.ACCOUNTANT, roles.SALES_STAFF]), exportController.invoicePdf);
router.get('/products.xlsx', authorize([roles.ADMIN, roles.STORE_MANAGER]), exportController.exportProductsExcel);

module.exports = router;

