const salesService = require('../services/salesService');

function listSales(req, res) {
  return res.json(salesService.getSales());
}

function createSale(req, res) {
  const { stage, customerName, items, dueDate, paid } = req.body;
  if (!stage || !customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Stage, customerName and items are required' });
  }
  try {
    const sale = salesService.createSale({ stage, customerName, items, dueDate, paid });
    return res.status(201).json(sale);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create sale' });
  }
}

function customerLedger(req, res) {
  const { customerId } = req.params;
  if (!customerId) {
    return res.status(400).json({ message: 'customerId is required' });
  }
  const ledger = salesService.getCustomerLedger(customerId);
  return res.json(ledger);
}

module.exports = {
  listSales,
  createSale,
  customerLedger,
};

