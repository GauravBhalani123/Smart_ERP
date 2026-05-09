const accountingService = require('../services/accountingService');

function listLedger(req, res) {
  return res.json(accountingService.getLedger());
}

function addPayment(req, res) {
  const { customerId, amount } = req.body;
  if (!customerId || !amount) {
    return res.status(400).json({ message: 'customerId and amount are required' });
  }
  const entry = accountingService.addEntry({
    type: 'PAYMENT',
    customerId,
    amount: Number(amount),
    debit: 0,
    credit: Number(amount),
  });
  return res.status(201).json(entry);
}

function addReceipt(req, res) {
  const { vendorId, amount } = req.body;
  if (!vendorId || !amount) {
    return res.status(400).json({ message: 'vendorId and amount are required' });
  }
  const entry = accountingService.addEntry({
    type: 'RECEIPT',
    vendorId,
    amount: Number(amount),
    debit: Number(amount),
    credit: 0,
  });
  return res.status(201).json(entry);
}

function profitSummary(req, res) {
  return res.json(accountingService.getProfitSummary());
}

module.exports = {
  listLedger,
  addPayment,
  addReceipt,
  profitSummary,
};

