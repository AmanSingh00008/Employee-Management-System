import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { clearAccessToken, setAccessToken } from "../utils/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true while we are checking whether there is an existing session on mount
  const [initializing, setInitializing] = useState(true);

  // On mount: try to restore session using the httpOnly refreshToken cookie.
  useEffect(() => {
    (async () => {
      try {
        // Ask the server for a new access token using the cookie
        const { data } = await api.get("/api/auth/refresh-token");
        setAccessToken(data.accessToken);

        // Fetch user profile with the fresh access token
        const meRes = await api.get("/api/auth/get-me");
        setUser(meRes.data.user);
      } catch {
        // No valid session — stay logged out
        clearAccessToken();
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
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
