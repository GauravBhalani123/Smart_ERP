import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { generateInvoicePdfBuffer } from "../../services/pdf.service.js";
import { sendEmail } from "../../services/email.service.js";

const router = Router();
router.use(requireAuth);

function invoiceNumber() {
  return `INV-${Date.now()}`;
}

router.get("/", requirePermission("sales:view"), async (_req, res) => {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { issueDate: "desc" },
  });
  res.json(invoices);
});

router.post("/", requirePermission("sales:manage"), async (req, res) => {
  const { customerId, saleId, items = [], companyName, companyLogo, qrText, dueDate, notes } = req.body;
  if (!customerId || items.length === 0) return res.status(400).json({ message: "customerId and items are required" });

  const products = await prisma.product.findMany({ where: { id: { in: items.map((x) => x.productId) } } });
  const byId = new Map(products.map((p) => [p.id, p]));
  let subtotal = 0;
  let taxAmount = 0;
  const lineItems = items.map((item) => {
    const p = byId.get(item.productId);
    if (!p) throw new Error("Invalid product in invoice");
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice ?? p.salePrice);
    const taxRate = Number(item.taxRate ?? 18);
    const lineSubtotal = qty * price;
    const lineTax = lineSubtotal * (taxRate / 100);
    const lineTotal = lineSubtotal + lineTax;
    subtotal += lineSubtotal;
    taxAmount += lineTax;
    return { productId: p.id, quantity: qty, unitPrice: price, taxRate, lineTotal };
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: invoiceNumber(),
      saleId,
      customerId,
      dueDate: dueDate ? new Date(dueDate) : null,
      companyName,
      companyLogo,
      qrText,
      notes,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      items: { create: lineItems },
    },
    include: { customer: true, items: { include: { product: true } } },
  });

  await prisma.activity.create({ data: { userId: req.user.id, action: "CREATE_INVOICE", entityType: "Invoice", entityId: invoice.id } });
  res.status(201).json(invoice);
});

router.get("/:id/pdf", requirePermission("sales:view"), async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  const buffer = await generateInvoicePdfBuffer(invoice);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNo}.pdf`);
  res.send(buffer);
});

router.post("/:id/email", requirePermission("sales:manage"), async (req, res) => {
  const { to } = req.body;
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });
  const recipient = to || invoice.customer?.email || process.env.EMAIL_USER;
  if (!recipient) return res.status(400).json({ message: "Recipient email missing" });

  const buffer = await generateInvoicePdfBuffer(invoice);
  const emailStatus = await sendEmail({
    to: recipient,
    subject: `Invoice ${invoice.invoiceNo}`,
    text: `Please find attached invoice ${invoice.invoiceNo}.\nTotal: ${invoice.totalAmount}\nCustomer: ${invoice.customer?.name || "-"}`,
    html: `<div style="font-family:Arial,sans-serif">
      <h2 style="margin:0 0 8px 0">Invoice ${invoice.invoiceNo}</h2>
      <p style="margin:0 0 6px 0">Customer: <b>${invoice.customer?.name || "-"}</b></p>
      <p style="margin:0 0 12px 0">Total Amount: <b>${invoice.totalAmount}</b></p>
      <p style="margin:0">PDF invoice is attached.</p>
    </div>`,
    attachments: [{ filename: `${invoice.invoiceNo}.pdf`, content: buffer }],
  });
  if (emailStatus.error) {
    return res.status(500).json({ message: "Email send failed", emailStatus });
  }
  if (Array.isArray(emailStatus.rejected) && emailStatus.rejected.length > 0) {
    return res.status(500).json({ message: "Email rejected by SMTP", emailStatus });
  }
  res.json({ message: "Invoice email processed", emailStatus });
});

export default router;
