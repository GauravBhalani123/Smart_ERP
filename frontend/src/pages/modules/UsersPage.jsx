import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function UsersPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    try {
      const data = await apiRequest("/users", { token });
      setRows(data);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function updateRole(id, role) {
    try {
      await apiRequest(`/users/${id}/role`, { method: "PATCH", token, body: { role } });
      setToast("Role updated");
      setTimeout(() => setToast(""), 2000);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <AppLayout>
      <div className="glass rounded-xl p-4">
        <h3 className="mb-3 font-semibold">User Management</h3>
        {user?.role !== "ADMIN" ? <p className="text-sm text-rose-400">Only admins can manage users.</p> : null}
        {toast ? <p className="mb-2 text-sm text-emerald-300">{toast}</p> : null}
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {rows.map((row) => (
          <div key={row.id} className="mb-2 flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
            <span>{row.fullName} ({row.email})</span>
            <select className="rounded bg-slate-800 p-1" value={row.role} onChange={(e) => updateRole(row.id, e.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
