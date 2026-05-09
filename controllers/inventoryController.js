const inventoryService = require('../services/inventoryService');

function listProducts(req, res) {
  return res.json(inventoryService.getProducts());
}

function createProduct(req, res) {
  try {
    const product = inventoryService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create product' });
  }
}

function listCategories(req, res) {
  return res.json(inventoryService.getCategories());
}

function createCategory(req, res) {
  try {
    const category = inventoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create category' });
  }
}

function adjustStock(req, res) {
  const { productId, location, rack, quantityChange, reason } = req.body;
  if (!productId || !location || !rack || !quantityChange) {
    return res.status(400).json({ message: 'Missing stock adjustment fields' });
  }
  const record = inventoryService.adjustStock({
    productId,
    location,
    rack,
    quantityChange: Number(quantityChange),
    reason: reason || 'manual',
  });
  return res.json(record);
}

function listStock(req, res) {
  return res.json(inventoryService.getStock());
}

module.exports = {
  listProducts,
  createProduct,
  listCategories,
  createCategory,
  adjustStock,
  listStock,
};

