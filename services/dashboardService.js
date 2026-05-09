const { readJson } = require('../utils/fileStorage');

const SALES_FILE = 'sales.json';
const PURCHASES_FILE = 'purchases.json';
const STOCK_FILE = 'stock.json';
const LEDGER_FILE = 'ledger.json';

function getDashboardSummary() {
  const sales = readJson(SALES_FILE, []);
  const purchases = readJson(PURCHASES_FILE, []);
  const stock = readJson(STOCK_FILE, []);
  const ledger = readJson(LEDGER_FILE, []);

  const totalSales = sales
    .filter((s) => s.stage === 'INVOICE')
    .reduce((sum, s) => sum + (s.totals?.grandTotal || 0), 0);

  const totalPurchase = purchases.reduce((sum, p) => sum + (p.total || 0), 0);

  const stockSummary = stock.reduce((sum, s) => sum + (s.quantity || 0), 0);

  let profit = 0;
  ledger.forEach((e) => {
    if (e.type === 'SALE') profit += e.credit || 0;
    if (e.type === 'PURCHASE') profit -= e.debit || 0;
  });

  return {
    totalSales,
    totalPurchase,
    profit,
    stockSummary,
  };
}

module.exports = {
  getDashboardSummary,
};

