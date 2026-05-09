const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStorage');
const inventoryService = require('./inventoryService');

const PURCHASES_FILE = 'purchases.json';
const VENDORS_FILE = 'vendors.json';
const LEDGER_FILE = 'ledger.json';

function getPurchases() {
  return readJson(PURCHASES_FILE, []);
}

function savePurchases(purchases) {
  writeJson(PURCHASES_FILE, purchases);
}

function getVendors() {
  return readJson(VENDORS_FILE, []);
}

function saveVendors(vendors) {
  writeJson(VENDORS_FILE, vendors);
}

function getLedger() {
  return readJson(LEDGER_FILE, []);
}

function saveLedger(ledger) {
  writeJson(LEDGER_FILE, ledger);
}

function ensureVendor(name) {
  const vendors = getVendors();
  let vendor = vendors.find((v) => v.name === name);
  if (!vendor) {
    vendor = { id: uuidv4(), name };
    vendors.push(vendor);
    saveVendors(vendors);
  }
  return vendor;
}

function createPurchase({ stage, vendorName, items, grnNumber }) {
  const purchases = getPurchases();
  const vendor = ensureVendor(vendorName);
  let total = 0;
  items.forEach((i) => {
    total += i.quantity * i.rate;
  });
  const id = uuidv4();
  const now = new Date().toISOString();

  const purchase = {
    id,
    stage, // PO | GRN
    vendorId: vendor.id,
    vendorName: vendor.name,
    items,
    total,
    grnNumber: grnNumber || null,
    createdAt: now,
  };

  purchases.push(purchase);
  savePurchases(purchases);

  if (stage === 'GRN') {
    items.forEach((item) => {
      inventoryService.adjustStock({
        productId: item.productId,
        location: item.location || 'MAIN',
        rack: item.rack || 'R1',
        quantityChange: Math.abs(item.quantity),
        reason: 'purchase',
      });
    });

    const ledger = getLedger();
    ledger.push({
      id: uuidv4(),
      type: 'PURCHASE',
      refId: id,
      vendorId: vendor.id,
      amount: total,
      debit: total,
      credit: 0,
      createdAt: now,
    });
    saveLedger(ledger);
  }

  return purchase;
}

function getVendorLedger(vendorId) {
  const ledger = getLedger();
  return ledger.filter((l) => l.vendorId === vendorId);
}

module.exports = {
  getPurchases,
  createPurchase,
  getVendorLedger,
};

