import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function InventoryPage() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState({ cards: {}, rows: [] });
  const [movements, setMovements] = useState([]);

  async function load() {
    const [inv, mov] = await Promise.all([
      apiRequest("/catalog/inventory", { token }),
      apiRequest("/catalog/inventory/movements", { token }),
    ]);
    setInventory(inv);
    setMovements(mov.slice(0, 20));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(inventory.cards || {}).map(([k, v]) => (
          <div key={k} className="glass rounded-xl p-4">
            <p className="text-sm text-slate-400">{k}</p>
            <p className="text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Inventory Status</h3>
          {inventory.rows.map((r) => (
            <div key={r.id} className="mb-2 flex justify-between rounded bg-slate-900/70 p-2 text-sm">
              <span>{r.product.name}</span>
              <span>{r.quantity} [{r.status}]</span>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Stock Movement History</h3>
          {movements.map((m) => (
            <div key={m.id} className="mb-2 rounded bg-slate-900/70 p-2 text-sm">
              {m.type}: {m.product.name} ({m.quantity})
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
