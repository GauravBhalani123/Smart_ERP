const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStorage');
const inventoryService = require('./inventoryService');

const SALES_FILE = 'sales.json';
const CUSTOMERS_FILE = 'customers.json';
const LEDGER_FILE = 'ledger.json';

function getSales() {
  return readJson(SALES_FILE, []);
}

function saveSales(sales) {
  writeJson(SALES_FILE, sales);
}

function getCustomers() {
  return readJson(CUSTOMERS_FILE, []);
}

function saveCustomers(customers) {
  writeJson(CUSTOMERS_FILE, customers);
}

function getLedger() {
  return readJson(LEDGER_FILE, []);
}

function saveLedger(ledger) {
  writeJson(LEDGER_FILE, ledger);
}

function ensureCustomer(name) {
  const customers = getCustomers();
  let customer = customers.find((c) => c.name === name);
  if (!customer) {
    customer = { id: uuidv4(), name };
    customers.push(customer);
    saveCustomers(customers);
  }
  return customer;
}

function calculateGSTAndTotals(items) {
  let subTotal = 0;
  let gstTotal = 0;
  items.forEach((item) => {
    const lineAmount = item.quantity * item.rate;
    subTotal += lineAmount;
    const gstAmount = (lineAmount * (item.gstRate || 0)) / 100;
    gstTotal += gstAmount;
  });
  return {
    subTotal,
    gstTotal,
    grandTotal: subTotal + gstTotal,
  };
}

function createSale({ stage, customerName, items, dueDate, paid }) {
  const sales = getSales();
  const customer = ensureCustomer(customerName);
  const totals = calculateGSTAndTotals(items);
  const id = uuidv4();
  const now = new Date().toISOString();

  const sale = {
    id,
    stage, // QUOTATION | ORDER | INVOICE
    customerId: customer.id,
    customerName: customer.name,
    items,
    totals,
    createdAt: now,
    dueDate: dueDate || null,
    paid: !!paid,
  };

  sales.push(sale);
  saveSales(sales);

  if (stage === 'INVOICE') {
    // Reduce stock
    items.forEach((item) => {
      inventoryService.adjustStock({
        productId: item.productId,
        location: item.location || 'MAIN',
        rack: item.rack || 'R1',
        quantityChange: -Math.abs(item.quantity),
        reason: 'sale',
      });
    });

    // Ledger entry
    const ledger = getLedger();
    ledger.push({
      id: uuidv4(),
      type: 'SALE',
      refId: id,
      customerId: customer.id,
      amount: totals.grandTotal,
      credit: totals.grandTotal,
      debit: 0,
      createdAt: now,
    });
    saveLedger(ledger);
  }

  return sale;
}

function getCustomerLedger(customerId) {
  const ledger = getLedger();
  return ledger.filter((l) => l.customerId === customerId);
}

module.exports = {
  getSales,
  createSale,
  getCustomerLedger,
};

