import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function AIAssistantPage() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState({ predictions: [], market: [] });

  useEffect(() => {
    Promise.all([apiRequest("/ai/chat/history", { token }), apiRequest("/ai/insights", { token })]).then(([h, i]) => {
      setHistory(h);
      setInsights(i);
    });
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-xl p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold">AI Chat History</h3>
          {history.map((chat) => (
            <div key={chat.id} className="mb-3 rounded bg-slate-900/70 p-3">
              <p className="mb-2 text-xs text-slate-400">{chat.language.toUpperCase()} | {chat.title || "Conversation"}</p>
              {chat.messages.slice(-4).map((m) => (
                <p key={m.id} className="mb-1 text-sm">
                  <span className="font-semibold">{m.role}: </span>
                  {m.content}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-4">
          <h3 className="mb-3 font-semibold">Business Recommendations</h3>
          {insights.predictions.slice(0, 6).map((p) => (
            <div key={p.id} className="mb-2 rounded bg-slate-900/70 p-3 text-sm">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-400">{p.details}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
