import PDFDocument from "pdfkit";
import QRCode from "qrcode";

function money(n) {
  const value = Number(n || 0);
  return value.toFixed(2);
}

export async function generateInvoicePdfBuffer(invoice) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const tableWidth = right - left;

    // Header
    doc.fillColor("#111827").fontSize(22).text(invoice.companyName || "Your Company", left, 48);
    doc.fillColor("#4b5563").fontSize(11).text("TAX INVOICE", left, 76);
    doc.fillColor("#111827").fontSize(10).text(`Invoice No: ${invoice.invoiceNo}`, right - 170, 50, { width: 170, align: "right" });
    doc.fillColor("#4b5563").fontSize(10).text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, right - 170, 66, { width: 170, align: "right" });
    doc.fillColor("#4b5563").fontSize(10).text(`Due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}`, right - 170, 82, { width: 170, align: "right" });

    doc.moveTo(left, 102).lineTo(right, 102).strokeColor("#d1d5db").lineWidth(1).stroke();

    // Bill to
    doc.fillColor("#374151").fontSize(10).text("BILL TO", left, 116);
    doc.fillColor("#111827").fontSize(12).text(invoice.customer?.name || "-", left, 132);
    doc.fillColor("#4b5563").fontSize(10).text(invoice.customer?.email || "", left, 148);

    const qrDataUrl = await QRCode.toDataURL(invoice.qrText || invoice.invoiceNo);
    doc.image(Buffer.from(qrDataUrl.split(",")[1], "base64"), right - 70, 116, { fit: [56, 56] });

    // Items table header
    let y = 190;
    doc.rect(left, y, tableWidth, 24).fill("#111827");
    doc.fillColor("#ffffff").fontSize(10);
    doc.text("#", left + 8, y + 7, { width: 20 });
    doc.text("Item", left + 28, y + 7, { width: 230 });
    doc.text("Qty", left + 260, y + 7, { width: 50, align: "right" });
    doc.text("Rate", left + 315, y + 7, { width: 70, align: "right" });
    doc.text("GST%", left + 390, y + 7, { width: 55, align: "right" });
    doc.text("Amount", right - 82, y + 7, { width: 74, align: "right" });

    y += 24;
    invoice.items.forEach((item, idx) => {
      doc.rect(left, y, tableWidth, 22).strokeColor("#e5e7eb").lineWidth(1).stroke();
      doc.fillColor("#111827").fontSize(10);
      doc.text(String(idx + 1), left + 8, y + 6, { width: 20 });
      doc.text(item.product?.name || "-", left + 28, y + 6, { width: 230 });
      doc.text(String(item.quantity), left + 260, y + 6, { width: 50, align: "right" });
      doc.text(money(item.unitPrice), left + 315, y + 6, { width: 70, align: "right" });
      doc.text(String(item.taxRate ?? 0), left + 390, y + 6, { width: 55, align: "right" });
      doc.text(money(item.lineTotal), right - 82, y + 6, { width: 74, align: "right" });
      y += 22;
    });

    y += 14;
    const boxW = 230;
    const boxX = right - boxW;
    doc.rect(boxX, y, boxW, 90).strokeColor("#d1d5db").lineWidth(1).stroke();
    doc.fillColor("#374151").fontSize(10).text("Subtotal", boxX + 12, y + 14);
    doc.fillColor("#111827").text(money(invoice.subtotal), boxX + 12, y + 14, { width: boxW - 24, align: "right" });
    doc.fillColor("#374151").text("GST / Tax", boxX + 12, y + 36);
    doc.fillColor("#111827").text(money(invoice.taxAmount), boxX + 12, y + 36, { width: boxW - 24, align: "right" });
    doc.fillColor("#111827").fontSize(12).text("Grand Total", boxX + 12, y + 60);
    doc.text(money(invoice.totalAmount), boxX + 12, y + 60, { width: boxW - 24, align: "right" });

    const footerY = doc.page.height - 60;
    doc.fillColor("#6b7280").fontSize(9).text("This is a system generated invoice.", left, footerY);
    if (invoice.notes) doc.fillColor("#6b7280").fontSize(9).text(`Notes: ${invoice.notes}`, left, footerY + 14, { width: tableWidth });

    doc.end();
  });
}
