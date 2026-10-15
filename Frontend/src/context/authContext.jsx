
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);
const USERS_KEY = "workforcehub_demo_users";
const SESSION_KEY = "workforcehub_demo_session";

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const register = ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.some((item) => item.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    // DEMO ONLY: Never store plain-text passwords in production.
    const newUser = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

    const sessionUser = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
    };

    setUser(sessionUser);
    return sessionUser;
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = readUsers().find(
      (item) =>
        item.email === normalizedEmail && item.password === password
    );

    if (!existingUser) {
      throw new Error("Invalid email or password.");
    }

    const sessionUser = {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email,
    };

    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setLoading, register, login, logout }}
    >
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
