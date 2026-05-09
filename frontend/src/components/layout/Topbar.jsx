import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

export default function Topbar() {
  const { user, logout, token } = useAuth();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest("/notifications", { token })
      .then((res) => {
        setUnread(res.unreadCount || 0);
        if ((res.unreadCount || 0) > 0) {
          setToast(`${res.unreadCount} active alert(s)`);
          setTimeout(() => setToast(""), 3000);
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <header className="glass relative flex items-center justify-between rounded-xl p-4">
      <div>
        <p className="text-sm text-slate-300">Welcome back</p>
        <h2 className="text-lg font-semibold">{user?.fullName}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs">Alerts: {unread}</span>
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs">{user?.role}</span>
        <button onClick={logout} className="rounded-lg bg-rose-500/80 px-3 py-2 text-sm hover:bg-rose-500">
          Logout
        </button>
      </div>
      {toast ? <div className="absolute -bottom-10 right-0 rounded bg-slate-800 px-3 py-2 text-xs text-amber-200">{toast}</div> : null}
    </header>
  );
}
