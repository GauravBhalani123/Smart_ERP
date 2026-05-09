import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", sku: "", salePrice: "", costPrice: "", reorderLevel: 10, criticalLevel: 5, categoryId: "" });
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const [productsRes, categoriesRes] = await Promise.all([
      apiRequest("/catalog/products", { token }),
      apiRequest("/catalog/categories", { token }),
    ]);
    setProducts(productsRes);
    setCategories(categoriesRes);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    const payload = { ...form, salePrice: Number(form.salePrice), costPrice: Number(form.costPrice) };
    if (editingId) {
      await apiRequest(`/catalog/products/${editingId}`, { method: "PUT", token, body: payload });
    } else {
      await apiRequest("/catalog/products", { method: "POST", token, body: payload });
    }
    setEditingId(null);
    setForm({ name: "", sku: "", salePrice: "", costPrice: "", reorderLevel: 10, criticalLevel: 5, categoryId: "" });
    load();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      salePrice: product.salePrice ?? "",
      costPrice: product.costPrice ?? "",
      reorderLevel: product.reorderLevel ?? 10,
      criticalLevel: product.criticalLevel ?? 5,
      categoryId: product.categoryId || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", sku: "", salePrice: "", costPrice: "", reorderLevel: 10, criticalLevel: 5, categoryId: "" });
  }

  async function removeProduct(id) {
    await apiRequest(`/catalog/products/${id}`, { method: "DELETE", token });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4 lg:col-span-1">
          <h3 className="mb-3 font-semibold">{editingId ? "Edit Product" : "Create Product"}</h3>
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Sale Price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Cost Price" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          <select className="mb-2 w-full rounded bg-slate-900 p-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">No Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="w-full rounded bg-indigo-600 p-2">{editingId ? "Update" : "Add"}</button>
            {editingId ? (
              <button type="button" onClick={cancelEdit} className="rounded bg-slate-700 px-3 py-2 text-sm">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Products</h3>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
                <div>
                  <p className="font-medium">{p.name} ({p.sku})</p>
                  <p className="text-xs text-slate-400">{p.category?.name || "Uncategorized"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>Stock: {p.inventory?.quantity ?? 0}</p>
                  <button onClick={() => startEdit(p)} className="rounded bg-amber-600 px-2 py-1 text-xs">Edit</button>
                  <button onClick={() => removeProduct(p.id)} className="rounded bg-rose-600 px-2 py-1 text-xs">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
