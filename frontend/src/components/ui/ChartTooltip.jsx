export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="mb-1 font-semibold text-slate-100">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <span className="text-slate-300">{p.name}</span>
            <span className="font-semibold text-white">{typeof p.value === "number" ? p.value.toFixed(2) : String(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

