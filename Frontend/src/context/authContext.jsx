import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { clearAccessToken, setAccessToken } from "../utils/axios.js";

const AuthContext = createContext(null);
let sessionRestorePromise;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we are checking whether there is an existing session on mount
  const [initializing, setInitializing] = useState(true);

  // On mount: try to restore session using the httpOnly refreshToken cookie.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        if (!sessionRestorePromise) {
          sessionRestorePromise = (async () => {
            const { data } = await api.get("/api/auth/refresh-token");
            setAccessToken(data.accessToken);
            const meRes = await api.get("/api/auth/get-me");
            return meRes.data.user;
          })().finally(() => {
            sessionRestorePromise = null;
          });
        }
        const restoredUser = await sessionRestorePromise;
        if (!cancelled) setUser(restoredUser);
      } catch {
        if (!cancelled) {
          clearAccessToken();
          setUser(null);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.get("/api/auth/logout");
    } catch {
      // Proceed regardless — clear client state
    }
    clearAccessToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
