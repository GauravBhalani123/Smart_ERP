import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "../../components/layout/AppLayout";
import ChartTooltip from "../../components/ui/ChartTooltip";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function MarketIntelligencePage() {
  const { token } = useAuth();
  const [prices, setPrices] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [p, pred] = await Promise.all([apiRequest("/market/prices", { token }), apiRequest("/market/predictions", { token })]);
      setPrices(p);
      setPredictions(pred);
    } catch (err) {
      setError(err.message || "Market data load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refreshNow() {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/market/prices/fetch", { method: "POST", token });
      await apiRequest("/market/predictions/run", { method: "POST", token });
      await load();
    } catch (err) {
      setError(err.message || "Market refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mb-4 flex justify-end">
        <button onClick={refreshNow} className="rounded bg-indigo-600 px-3 py-2 text-sm" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Market Intelligence"}
        </button>
      </div>
      {error ? <div className="mb-4 rounded bg-rose-900/60 p-3 text-sm text-rose-100">{error}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Material Price Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prices}>
                <XAxis dataKey="material" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#334155", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="price" stroke="#818cf8" fill="#818cf833" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">AI Market Analysis</h3>
          {prices.map((p) => (
            <div key={p.id} className="mb-2 rounded bg-slate-900/70 p-3 text-sm">
              <p className="font-medium">{p.material}</p>
              <p className="text-xs text-slate-400">
                {p.price} {p.unit} ({p.changePct}% / {p.trend})
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass mt-4 rounded-xl p-4">
        <h3 className="mb-3 font-semibold">Prediction Engine Output</h3>
        {predictions.map((row) => (
          <div key={row.id} className="mb-2 rounded bg-slate-900/70 p-3 text-sm">
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-slate-400">{row.details}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
