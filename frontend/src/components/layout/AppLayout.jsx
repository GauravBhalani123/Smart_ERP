import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingAssistant from "../ai/FloatingAssistant";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-4">
        <Sidebar />
        <main className="flex-1 space-y-4">
          <Topbar />
          {children}
        </main>
      </div>
      <FloatingAssistant />
    </div>
  );
}
