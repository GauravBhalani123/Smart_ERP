import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/branding/Logo";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-md rounded-xl p-6">
        <div className="mb-4">
          <Logo size="lg" />
        </div>
        <h1 className="mb-4 text-2xl font-bold">Create Account</h1>
        <input className="mb-3 w-full rounded-lg bg-slate-900 p-3" placeholder="Full name" onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="mb-3 w-full rounded-lg bg-slate-900 p-3" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mb-3 w-full rounded-lg bg-slate-900 p-3" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}
        <button className="w-full rounded-lg bg-indigo-600 p-3 font-medium hover:bg-indigo-500">Create Account</button>
        <p className="mt-4 text-sm text-slate-400">
          Already have account? <Link to="/login" className="text-indigo-300">Login</Link>
        </p>
      </form>
    </div>
  );
}
