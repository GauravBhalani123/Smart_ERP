import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function CustomersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [analytics, setAnalytics] = useState(null);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setRows(await apiRequest("/parties/customers", { token }));
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (editingId) {
      await apiRequest(`/parties/customers/${editingId}`, { method: "PUT", token, body: form });
    } else {
      await apiRequest("/parties/customers", { method: "POST", token, body: form });
    }
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
    load();
  }

  async function loadAnalytics(id) {
    setAnalytics(await apiRequest(`/parties/customers/${id}/analytics`, { token }));
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name || "", email: row.email || "", phone: row.phone || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "" });
  }

  async function removeCustomer(id) {
    await apiRequest(`/parties/customers/${id}`, { method: "DELETE", token });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={submit} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">{editingId ? "Edit Customer" : "New Customer"}</h3>
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
          <h3 className="mb-3 font-semibold">Customers</h3>
          {rows.map((row) => (
            <div key={row.id} className="mb-2 flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
              <button onClick={() => loadAnalytics(row.id)} className="text-left">
                {row.name} - {row.email || "No email"}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(row)} className="rounded bg-amber-600 px-2 py-1 text-xs">Edit</button>
                <button onClick={() => removeCustomer(row.id)} className="rounded bg-rose-600 px-2 py-1 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {analytics ? <p className="mt-3 text-sm text-slate-300">Total Sales: {analytics.totalSales}, LTV: {analytics.lifetimeValue}</p> : null}
        </div>
      </div>
    </AppLayout>
  );
}
