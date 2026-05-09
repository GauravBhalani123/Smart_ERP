const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const { readJson } = require('../utils/fileStorage');

const SALES_FILE = 'sales.json';
const PRODUCTS_FILE = 'products.json';

function invoicePdf(req, res) {
  const { id } = req.params;
  const sales = readJson(SALES_FILE, []);
  const sale = sales.find((s) => s.id === id);
  if (!sale) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=invoice-${id}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Customer: ${sale.customerName}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
  doc.moveDown();

  sale.items.forEach((item) => {
    doc.text(
      `${item.description || item.productId} - Qty: ${item.quantity} Rate: ${item.rate} GST: ${item.gstRate || 0}%`
    );
  });
  doc.moveDown();
  doc.text(`Subtotal: ${sale.totals.subTotal.toFixed(2)}`);
  doc.text(`GST: ${sale.totals.gstTotal.toFixed(2)}`);
  doc.text(`Grand Total: ${sale.totals.grandTotal.toFixed(2)}`);

  doc.end();
}

function exportProductsExcel(req, res) {
  const products = readJson(PRODUCTS_FILE, []);
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="products.xlsx"'
  );
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  return res.send(buffer);
}

module.exports = {
  invoicePdf,
  exportProductsExcel,
};

