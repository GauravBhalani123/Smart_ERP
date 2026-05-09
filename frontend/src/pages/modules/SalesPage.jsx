import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

function isFinished(product) {
  return (product?.category?.name || "").toLowerCase().includes("finished");
}

export default function SalesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1, unitPrice: 0 });

  async function load() {
    const [sales, customersRes, productsRes] = await Promise.all([
      apiRequest("/sales", { token }),
      apiRequest("/parties/customers", { token }),
      apiRequest("/catalog/products", { token }),
    ]);
    setRows(sales);
    setCustomers(customersRes);
    setProducts(productsRes.filter((p) => isFinished(p) || !p.category));
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await apiRequest("/sales", {
      method: "POST",
      token,
      body: {
        customerId: form.customerId,
        items: [{ productId: form.productId, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) }],
      },
    });
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Sales Entry</h3>
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
          <button className="w-full rounded bg-indigo-600 p-2">Create Sale</button>
        </form>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Sales History</h3>
          {rows.map((r) => (
            <div key={r.id} className="mb-2 rounded bg-slate-900/70 p-3 text-sm">
              {r.saleNo} - {r.customer?.name} - Total: {r.totalAmount} - Profit: {r.profitAmount}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
