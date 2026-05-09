import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/branding/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@erp.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="glass w-full max-w-md rounded-xl p-6">
        <div className="mb-4">
          <Logo size="lg" />
        </div>
        <h1 className="mb-1 text-2xl font-bold">ERP Login</h1>
        <p className="mb-6 text-sm text-slate-400">Secure access to your AI-powered ERP workspace.</p>
        <input className="mb-3 w-full rounded-lg bg-slate-900 p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="mb-3 w-full rounded-lg bg-slate-900 p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}
        <button className="w-full rounded-lg bg-indigo-600 p-3 font-medium hover:bg-indigo-500" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="mt-4 text-sm text-slate-400">
          No account? <Link to="/register" className="text-indigo-300">Register</Link>
        </p>
      </form>
    </div>
  );
}
