import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("erp_token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("erp_user") || "null"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return setLoading(false);
    apiRequest("/auth/me", { token })
      .then((result) => setUser(result.user))
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const result = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem("erp_token", result.token);
    localStorage.setItem("erp_user", JSON.stringify(result.user));
  };

  const register = async (payload) => {
    const result = await apiRequest("/auth/register", { method: "POST", body: payload });
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem("erp_token", result.token);
    localStorage.setItem("erp_user", JSON.stringify(result.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
  };

  const value = useMemo(() => ({ token, user, loading, login, register, logout }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
