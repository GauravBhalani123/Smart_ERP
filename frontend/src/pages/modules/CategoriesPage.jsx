import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function CategoriesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/catalog/categories", { token });
      setRows(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(event) {
    event.preventDefault();
    setError("");
    await apiRequest("/catalog/categories", { method: "POST", token, body: { name, description } });
    setName("");
    setDescription("");
    load();
  }

  async function remove(id) {
    await apiRequest(`/catalog/categories/${id}`, { method: "DELETE", token });
    load();
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={create} className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Add Category</h3>
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="mb-2 w-full rounded bg-slate-900 p-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="w-full rounded bg-indigo-600 p-2" disabled={loading || !name.trim()}>
            {loading ? "Saving..." : "Save"}
          </button>
          {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
        </form>

        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Categories</h3>
          {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
          <div className="space-y-2">
            {rows.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.description ? <p className="text-xs text-slate-400">{c.description}</p> : null}
                </div>
                <button onClick={() => remove(c.id)} className="rounded bg-rose-600 px-2 py-1 text-xs">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

