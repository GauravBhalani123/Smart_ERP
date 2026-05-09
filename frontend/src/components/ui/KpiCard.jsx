import { motion } from "framer-motion";

export default function KpiCard({ title, value, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className={`mt-1 text-xs ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{trend}% vs last period</p>
    </motion.div>
  );
}
