import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "../../components/layout/AppLayout";
import ChartTooltip from "../../components/ui/ChartTooltip";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function ReportsPage() {
  const { token } = useAuth();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    Promise.all([apiRequest("/sales/report/monthly", { token }), apiRequest("/purchases/report/monthly", { token })]).then(([s, p]) => {
      setSales(s);
      setPurchases(p);
    });
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-slate-900/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Sales & Profit Trend</h3>
            <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-[11px] text-indigo-200">AI Analytics</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#334155", strokeWidth: 1 }} />
                <Legend />
                <Line dataKey="sales" stroke="#818cf8" strokeWidth={2} dot={false} />
                <Line dataKey="profit" stroke="#34d399" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/20 to-slate-900/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Purchase Trend</h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-200">Procurement</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchases}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(51,65,85,0.18)" }} />
                <Bar dataKey="total" fill="#60a5fa" radius={[8, 8, 0, 0]} activeBar={{ fill: "#7fb9ff" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
