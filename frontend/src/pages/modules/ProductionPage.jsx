import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

function classifyProduct(product) {
  const c = (product?.category?.name || "").toLowerCase();
  if (c.includes("finished")) return "finished";
  if (c.includes("raw")) return "raw";
  if (c.includes("packing")) return "packing";
  return "other";
}

export default function ProductionPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [outputProductId, setOutputProductId] = useState("");
  const [outputQuantity, setOutputQuantity] = useState(1);
  const [rawProductId, setRawProductId] = useState("");
  const [rawQty, setRawQty] = useState(1);
  const [packingProductId, setPackingProductId] = useState("");
  const [packingQty, setPackingQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/catalog/products", { token }).then(setProducts).catch(() => setProducts([]));
  }, [token]);

  const finishedProducts = useMemo(() => products.filter((p) => classifyProduct(p) === "finished"), [products]);
  const rawProducts = useMemo(() => products.filter((p) => classifyProduct(p) === "raw"), [products]);
  const packingProducts = useMemo(() => products.filter((p) => classifyProduct(p) === "packing"), [products]);

  async function convert(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiRequest("/catalog/production/convert", {
        method: "POST",
        token,
        body: {
          outputProductId,
          outputQuantity: Number(outputQuantity),
          notes,
          inputs: [
            { productId: rawProductId, quantity: Number(rawQty) },
            { productId: packingProductId, quantity: Number(packingQty) },
          ],
        },
      });
      setMessage("Production completed. Finished goods stock updated.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <AppLayout>
      <div className="glass rounded-xl p-4">
        <h3 className="mb-1 text-xl font-semibold">Production Conversion</h3>
        <p className="mb-4 text-sm text-slate-400">
          Consume Raw + Packing material and generate Finished goods for sale.
        </p>
        {message ? <div className="mb-3 rounded bg-emerald-900/50 p-2 text-sm text-emerald-100">{message}</div> : null}
        {error ? <div className="mb-3 rounded bg-rose-900/50 p-2 text-sm text-rose-100">{error}</div> : null}
        <form onSubmit={convert} className="grid gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Finished Goods</label>
            <select className="w-full rounded bg-slate-900 p-2 text-sm" value={outputProductId} onChange={(e) => setOutputProductId(e.target.value)} required>
              <option value="">Select finished product</option>
              {finishedProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Raw Material</label>
            <select className="w-full rounded bg-slate-900 p-2 text-sm" value={rawProductId} onChange={(e) => setRawProductId(e.target.value)} required>
              <option value="">Select raw material</option>
              {rawProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Packing Material</label>
            <select className="w-full rounded bg-slate-900 p-2 text-sm" value={packingProductId} onChange={(e) => setPackingProductId(e.target.value)} required>
              <option value="">Select packing material</option>
              {packingProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <input className="rounded bg-slate-900 p-2 text-sm" type="number" min="1" value={outputQuantity} onChange={(e) => setOutputQuantity(e.target.value)} placeholder="Finished qty" />
          <input className="rounded bg-slate-900 p-2 text-sm" type="number" min="1" value={rawQty} onChange={(e) => setRawQty(e.target.value)} placeholder="Raw qty consume" />
          <input className="rounded bg-slate-900 p-2 text-sm" type="number" min="1" value={packingQty} onChange={(e) => setPackingQty(e.target.value)} placeholder="Packing qty consume" />
          <input className="rounded bg-slate-900 p-2 text-sm lg:col-span-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Production notes (optional)" />
          <button className="rounded bg-indigo-600 p-2 text-sm font-medium hover:bg-indigo-500">Convert to Finished Goods</button>
        </form>
      </div>
    </AppLayout>
  );
}

