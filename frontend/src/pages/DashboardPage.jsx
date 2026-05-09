import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "../components/layout/AppLayout";
import ChartTooltip from "../components/ui/ChartTooltip";
import KpiCard from "../components/ui/KpiCard";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    apiRequest("/dashboard/summary", { token }).then(setData).catch(() => setData(null));
  }, [token]);

  const kpis = data?.kpis || {};
  return (
    <AppLayout>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Sales Summary" value={kpis.sales?.value ?? 0} trend={kpis.sales?.trend ?? 0} />
        <KpiCard title="Purchase Summary" value={kpis.purchases?.value ?? 0} trend={kpis.purchases?.trend ?? 0} />
        <KpiCard title="Inventory Summary" value={kpis.inventoryValue?.value ?? 0} trend={kpis.inventoryValue?.trend ?? 0} />
        <KpiCard title="Profit Summary" value={kpis.profit?.value ?? 0} trend={kpis.profit?.trend ?? 0} />
        <KpiCard title="User Statistics" value={kpis.activeUsers?.value ?? 0} trend={kpis.activeUsers?.trend ?? 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Sales vs Purchases</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.charts?.salesPurchase || []}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#334155", strokeWidth: 1 }} />
                <Line type="monotone" dataKey="sales" stroke="#818cf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="purchases" stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Notifications</h3>
          <div className="space-y-3">
            {(data?.notifications || []).map((n) => (
              <div key={n.id} className="rounded-lg bg-slate-900/70 p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-slate-400">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-900/20 to-slate-900/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Sales & Purchase Comparison</h3>
          <p className="rounded-full bg-sky-500/20 px-2 py-1 text-[11px] text-sky-200">Last 6 months</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.charts?.salesPurchase || []}>
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(51,65,85,0.18)" }} />
              <Bar dataKey="sales" fill="#818cf8" radius={[8, 8, 0, 0]} activeBar={{ fill: "#8b95ff" }} />
              <Bar dataKey="purchases" fill="#34d399" radius={[8, 8, 0, 0]} activeBar={{ fill: "#3ee0ab" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Inventory Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={data?.charts?.stockPie || []} outerRadius={80} label>
                  {(data?.charts?.stockPie || []).map((entry, index) => (
                    <Cell key={entry.name} fill={["#60a5fa", "#facc15", "#fb7185", "#f97316"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Recent Activity</h3>
          <div className="space-y-2">
            {(data?.activity || []).map((a) => (
              <div key={a.id} className="rounded-lg bg-slate-900/70 p-3 text-sm">
                <p className="font-medium">{a.action}</p>
                <p className="text-xs text-slate-400">{a.entityType}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </AppLayout>
  );
}
