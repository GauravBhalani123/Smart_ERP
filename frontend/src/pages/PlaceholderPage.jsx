import AppLayout from "../components/layout/AppLayout";

export default function PlaceholderPage({ title }) {
  return (
    <AppLayout>
      <div className="glass rounded-xl p-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-slate-400">
          This module is intentionally kept as a placeholder in the core ERP foundation starter.
        </p>
      </div>
    </AppLayout>
  );
}
