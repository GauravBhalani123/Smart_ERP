import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function SuppliersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [analytics, setAnalytics] = useState(null);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const data = await apiRequest("/parties/suppliers", { token });
    setRows(data);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await apiRequest(`/parties/suppliers/${editingId}`, { method: "PUT", token, body: form });
    } else {
      await apiRequest("/parties/suppliers", { method: "POST", token, body: form });
    }
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
    load();
  }

  async function loadAnalytics(id) {
    const result = await apiRequest(`/parties/suppliers/${id}/analytics`, { token });
    setAnalytics(result);
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name || "", email: row.email || "", phone: row.phone || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
  }

  async function removeSupplier(id) {
    await apiRequest(`/parties/suppliers/${id}`, { method: "DELETE", token });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">{editingId ? "Edit Supplier" : "New Supplier"}</h3>
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex gap-2">
            <button className="w-full rounded bg-indigo-600 p-2">{editingId ? "Update" : "Add"}</button>
            {editingId ? (
              <button type="button" onClick={cancelEdit} className="rounded bg-slate-700 px-3 py-2 text-sm">Cancel</button>
            ) : null}
          </div>
        </form>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Suppliers</h3>
          {rows.map((s) => (
            <div key={s.id} className="mb-2 flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
              <button onClick={() => loadAnalytics(s.id)} className="text-left">
                {s.name} - {s.email || "No email"}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(s)} className="rounded bg-amber-600 px-2 py-1 text-xs">Edit</button>
                <button onClick={() => removeSupplier(s.id)} className="rounded bg-rose-600 px-2 py-1 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {analytics ? <p className="mt-3 text-sm text-slate-300">Total Purchases: {analytics.totalPurchases}, Total Spend: {analytics.totalSpend}</p> : null}
        </div>
      </div>
    </AppLayout>
  );
}
