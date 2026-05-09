import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function PurchasesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ supplierId: "", productId: "", quantity: 1, unitCost: 0 });

  async function load() {
    const [purchases, suppliersRes, productsRes] = await Promise.all([
      apiRequest("/purchases", { token }),
      apiRequest("/parties/suppliers", { token }),
      apiRequest("/catalog/products", { token }),
    ]);
    setRows(purchases);
    setSuppliers(suppliersRes);
    setProducts(productsRes);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await apiRequest("/purchases", {
      method: "POST",
      token,
      body: {
        supplierId: form.supplierId,
        items: [{ productId: form.productId, quantity: Number(form.quantity), unitCost: Number(form.unitCost) }],
      },
    });
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Purchase Entry</h3>
          <select className="mb-2 w-full rounded bg-slate-900 p-2" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="mb-2 w-full rounded bg-slate-900 p-2" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="mb-2 w-full rounded bg-slate-900 p-2" type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" type="number" placeholder="Unit Cost" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
          <button className="w-full rounded bg-indigo-600 p-2">Add Purchase</button>
        </form>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Purchase History</h3>
          {rows.map((r) => (
            <div key={r.id} className="mb-2 rounded bg-slate-900/70 p-3 text-sm">
              {r.purchaseNo} - {r.supplier?.name} - {r.totalAmount}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
