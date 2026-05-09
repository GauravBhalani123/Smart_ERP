const { readJson } = require('../utils/fileStorage');
const inventoryService = require('./inventoryService');

const SALES_FILE = 'sales.json';

function getLowStockAlerts() {
  const lowProducts = inventoryService.getLowStockProducts();
  return lowProducts.map((p) => ({
    type: 'LOW_STOCK',
    message: `Low stock for ${p.name}`,
    productId: p.id,
  }));
}

function getPaymentDueAlerts() {
  const sales = readJson(SALES_FILE, []);
  const now = new Date();
  return sales
    .filter(
      (s) =>
        s.stage === 'INVOICE' &&
        s.dueDate &&
        !s.paid &&
        new Date(s.dueDate) < now
    )
    .map((s) => ({
      type: 'PAYMENT_DUE',
      message: `Payment due from ${s.customerName}`,
      saleId: s.id,
    }));
}

function getAllAlerts() {
  return [...getLowStockAlerts(), ...getPaymentDueAlerts()];
}

module.exports = {
  getLowStockAlerts,
  getPaymentDueAlerts,
  getAllAlerts,
};

