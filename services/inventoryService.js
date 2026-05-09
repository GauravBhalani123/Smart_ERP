const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStorage');

const PRODUCTS_FILE = 'products.json';
const CATEGORIES_FILE = 'categories.json';
const STOCK_FILE = 'stock.json';

function getProducts() {
  return readJson(PRODUCTS_FILE, []);
}

function saveProducts(products) {
  writeJson(PRODUCTS_FILE, products);
}

function getCategories() {
  return readJson(CATEGORIES_FILE, []);
}

function saveCategories(categories) {
  writeJson(CATEGORIES_FILE, categories);
}

function getStock() {
  return readJson(STOCK_FILE, []);
}

function saveStock(stock) {
  writeJson(STOCK_FILE, stock);
}

function createCategory(data) {
  const categories = getCategories();
  const category = {
    id: uuidv4(),
    name: data.name,
    description: data.description || '',
  };
  categories.push(category);
  saveCategories(categories);
  return category;
}

function createProduct(data) {
  const products = getProducts();
  const product = {
    id: uuidv4(),
    name: data.name,
    sku: data.sku,
    categoryId: data.categoryId,
    minStock: data.minStock || 0,
    maxStock: data.maxStock || 0,
    gstRate: data.gstRate || 0,
  };
  products.push(product);
  saveProducts(products);
  return product;
}

function adjustStock({ productId, location, rack, quantityChange, reason }) {
  const stock = getStock();
  const key = `${productId}|${location}|${rack}`;
  let record = stock.find((s) => s.key === key);
  if (!record) {
    record = {
      key,
      productId,
      location,
      rack,
      quantity: 0,
    };
    stock.push(record);
  }
  record.quantity += quantityChange;
  record.lastReason = reason;
  record.updatedAt = new Date().toISOString();
  saveStock(stock);
  return record;
}

function getLowStockProducts() {
  const products = getProducts();
  const stock = getStock();
  const totals = {};
  stock.forEach((s) => {
    totals[s.productId] = (totals[s.productId] || 0) + s.quantity;
  });
  return products.filter(
    (p) => p.minStock && (totals[p.id] || 0) < p.minStock
  );
}

module.exports = {
  getProducts,
  createProduct,
  getCategories,
  createCategory,
  adjustStock,
  getStock,
  getLowStockProducts,
};

