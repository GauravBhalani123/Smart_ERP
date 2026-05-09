export default function Logo({ size = "md" }) {
  const cls = size === "lg" ? "h-10 w-10" : "h-8 w-8";
  return (
    <div className="flex items-center gap-2">
      <div className={`grid place-items-center rounded-xl bg-indigo-600/90 ${cls}`}>
        <span className="text-sm font-black text-white">E</span>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-slate-100">Smart ERP</p>
        <p className="text-[11px] text-slate-400">AI Powered</p>
      </div>
    </div>
  );
}

