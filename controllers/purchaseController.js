const purchaseService = require('../services/purchaseService');

function listPurchases(req, res) {
  return res.json(purchaseService.getPurchases());
}

function createPurchase(req, res) {
  const { stage, vendorName, items, grnNumber } = req.body;
  if (!stage || !vendorName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Stage, vendorName and items are required' });
  }
  try {
    const purchase = purchaseService.createPurchase({ stage, vendorName, items, grnNumber });
    return res.status(201).json(purchase);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create purchase' });
  }
}

function vendorLedger(req, res) {
  const { vendorId } = req.params;
  if (!vendorId) {
    return res.status(400).json({ message: 'vendorId is required' });
  }
  const ledger = purchaseService.getVendorLedger(vendorId);
  return res.json(ledger);
}

module.exports = {
  listPurchases,
  createPurchase,
  vendorLedger,
};

