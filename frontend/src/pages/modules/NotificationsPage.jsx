import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [data, setData] = useState({ unreadCount: 0, rows: [] });

  async function load() {
    setData(await apiRequest("/notifications", { token }));
  }
  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    await apiRequest(`/notifications/${id}/read`, { method: "PATCH", token });
    load();
  }

  return (
    <AppLayout>
      <div className="glass rounded-xl p-4">
        <h3 className="mb-1 font-semibold">Notifications</h3>
        <p className="mb-3 text-sm text-slate-400">Unread: {data.unreadCount}</p>
        {data.rows.map((n) => (
          <div key={n.id} className="mb-2 flex items-center justify-between rounded bg-slate-900/70 p-3 text-sm">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="text-xs text-slate-400">{n.message}</p>
            </div>
            {!n.isRead ? <button onClick={() => markRead(n.id)} className="rounded bg-indigo-600 px-2 py-1 text-xs">Mark Read</button> : null}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
