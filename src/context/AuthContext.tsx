import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, clearTokens, setTokens } from "../lib/api";

interface UserOut {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface AuthContextValue {
  user: UserOut | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      const me = await api.get<UserOut>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("ns_access_token")) {
      refreshMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ access_token: string; refresh_token: string }>("/auth/login", {
      email,
      password,
    });
    setTokens(res.access_token, res.refresh_token);
    await refreshMe();
  }

  async function register(email: string, full_name: string, password: string) {
    const res = await api.post<{ access_token: string; refresh_token: string }>("/auth/register", {
      email,
      full_name,
      password,
    });
    setTokens(res.access_token, res.refresh_token);
    await refreshMe();
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
