import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { API_BASE, apiRequest } from "../../lib/api";

export default function InvoicesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1, unitPrice: 0, taxRate: 18 });
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [emailTo, setEmailTo] = useState("");

  async function load() {
    const [invoices, customersRes, productsRes] = await Promise.all([
      apiRequest("/invoices", { token }),
      apiRequest("/parties/customers", { token }),
      apiRequest("/catalog/products", { token }),
    ]);
    setRows(invoices);
    setCustomers(customersRes);
    setProducts(productsRes);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await apiRequest("/invoices", {
      method: "POST",
      token,
      body: {
        customerId: form.customerId,
        companyName: "Smart ERP Pvt Ltd",
        qrText: "https://example.com/pay",
        items: [{ productId: form.productId, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice), taxRate: Number(form.taxRate) }],
      },
    });
    load();
  }

  async function downloadPdf(invoice) {
    setBusyId(invoice.id);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/invoices/${invoice.id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "PDF download failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast("PDF downloaded");
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId("");
    }
  }

  async function sendInvoiceEmail(invoice) {
    setBusyId(invoice.id);
    setError("");
    try {
      const result = await apiRequest(`/invoices/${invoice.id}/email`, {
        method: "POST",
        token,
        body: emailTo.trim() ? { to: emailTo.trim() } : {},
      });
      if (result.emailStatus?.skipped) {
        setError(result.emailStatus.reason || "Email skipped");
      } else if (result.emailStatus?.error) {
        setError(`Email failed: ${result.emailStatus.error}`);
      } else {
        const accepted = result.emailStatus?.accepted?.[0] || emailTo || invoice.customer?.email || "mail";
        setToast(`Mail sent to: ${accepted}`);
        setTimeout(() => setToast(""), 2500);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Invoice Entry</h3>
          <select className="mb-2 w-full rounded bg-slate-900 p-2" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="mb-2 w-full rounded bg-slate-900 p-2" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="mb-2 w-full rounded bg-slate-900 p-2" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" type="number" placeholder="Unit Price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <button className="w-full rounded bg-indigo-600 p-2">Create Invoice</button>
        </form>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Invoice History</h3>
          <input
            className="mb-3 w-full rounded bg-slate-900 p-2 text-sm"
            placeholder="Optional recipient override email (example: project7394@gmail.com)"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
          />
          {toast ? <div className="mb-3 rounded bg-emerald-900/50 p-2 text-sm text-emerald-100">{toast}</div> : null}
          {error ? <div className="mb-3 rounded bg-rose-900/60 p-2 text-sm text-rose-100">{error}</div> : null}
          {rows.map((r) => (
            <div key={r.id} className="mb-2 flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
              <span>{r.invoiceNo} - {r.customer?.name} - {r.totalAmount}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPdf(r)}
                  disabled={busyId === r.id}
                  className="rounded bg-emerald-600 px-2 py-1 text-xs disabled:opacity-50"
                >
                  {busyId === r.id ? "..." : "Download PDF"}
                </button>
                <button
                  onClick={() => sendInvoiceEmail(r)}
                  disabled={busyId === r.id}
                  className="rounded bg-indigo-600 px-2 py-1 text-xs disabled:opacity-50"
                >
                  {busyId === r.id ? "..." : "Send Mail"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
