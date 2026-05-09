const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStorage');

const LEDGER_FILE = 'ledger.json';

function getLedger() {
  return readJson(LEDGER_FILE, []);
}

function saveLedger(ledger) {
  writeJson(LEDGER_FILE, ledger);
}

function addEntry({ type, refId, customerId, vendorId, amount, debit, credit }) {
  const ledger = getLedger();

  const entry = {
    id: uuidv4(),
    type,
    refId: refId || null,
    customerId: customerId || null,
    vendorId: vendorId || null,
    amount,
    debit: debit || 0,
    credit: credit || 0,
    createdAt: new Date().toISOString(),
  };

  ledger.push(entry);
  saveLedger(ledger);

  return entry;
}

function getProfitSummary() {
  const ledger = getLedger();
  let totalSales = 0;
  let totalPurchases = 0;

  ledger.forEach((e) => {
    if (e.type === 'SALE') {
      totalSales += e.credit || 0;
    }

    if (e.type === 'PURCHASE') {
      totalPurchases += e.debit || 0;
    }
  });

  return {
    totalSales,
    totalPurchases,
    profit: totalSales - totalPurchases,
  };
}

module.exports = {
  getLedger,
  addEntry,
  getProfitSummary,
};