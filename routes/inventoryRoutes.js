const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const { authMiddleware, authorize, roles } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/products', authorize([roles.ADMIN, roles.STORE_MANAGER, roles.SALES_STAFF]), invController.listProducts);
router.post('/products', authorize([roles.ADMIN, roles.STORE_MANAGER]), invController.createProduct);

router.get('/categories', authorize([roles.ADMIN, roles.STORE_MANAGER]), invController.listCategories);
router.post('/categories', authorize([roles.ADMIN, roles.STORE_MANAGER]), invController.createCategory);

router.get('/stock', authorize([roles.ADMIN, roles.STORE_MANAGER, roles.ACCOUNTANT]), invController.listStock);
router.post('/stock/adjust', authorize([roles.ADMIN, roles.STORE_MANAGER]), invController.adjustStock);

module.exports = router;

