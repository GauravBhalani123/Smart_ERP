import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../lib/api";

export default function SettingsPage() {
  const { token, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ fullName: "", email: "", currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile((prev) => ({ ...prev, fullName: user?.fullName || "", email: user?.email || "" }));
  }, [user]);

  async function saveProfile(event) {
    event.preventDefault();
    setMsg("");
    setError("");
    try {
      await apiRequest("/auth/profile", { method: "PATCH", token, body: profile });
      setMsg("Profile updated successfully.");
      setProfile((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="glass rounded-xl p-4">
          <h3 className="mb-3 text-lg font-semibold">Profile Settings</h3>
          {msg ? <div className="mb-2 rounded bg-emerald-900/50 p-2 text-sm text-emerald-100">{msg}</div> : null}
          {error ? <div className="mb-2 rounded bg-rose-900/50 p-2 text-sm text-rose-100">{error}</div> : null}
          <input className="mb-2 w-full rounded bg-slate-900 p-2 text-sm" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="Full name" />
          <input className="mb-2 w-full rounded bg-slate-900 p-2 text-sm" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
          <input className="mb-2 w-full rounded bg-slate-900 p-2 text-sm" type="password" value={profile.currentPassword} onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })} placeholder="Current password (if changing)" />
          <input className="mb-3 w-full rounded bg-slate-900 p-2 text-sm" type="password" value={profile.newPassword} onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} placeholder="New password" />
          <button className="w-full rounded bg-indigo-600 p-2 text-sm font-medium hover:bg-indigo-500">Save Profile</button>
        </form>

        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 text-lg font-semibold">Theme Settings</h3>
          <p className="mb-3 text-sm text-slate-400">Current theme: {theme}</p>
          <div className="flex gap-2">
            <button onClick={() => setTheme("dark")} className={`rounded px-3 py-2 text-sm ${theme === "dark" ? "bg-indigo-600" : "bg-slate-700"}`}>Dark</button>
            <button onClick={() => setTheme("light")} className={`rounded px-3 py-2 text-sm ${theme === "light" ? "bg-indigo-600" : "bg-slate-700"}`}>Light</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

