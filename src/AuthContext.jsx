import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

const DEMO_USERS = [
  { email: "demo@omni.com", password: "demo123", name: "Alex Rivera", plan: "PRO", avatar: "AR" },
  { email: "user@omni.com", password: "pass123", name: "Sam Chen", plan: "Basic", avatar: "SC" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const login = (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); setAuthError(""); return true; }
    setAuthError("Invalid email or password");
    return false;
  };

  const signup = (name, email, password) => {
    if (!name || !email || !password) { setAuthError("All fields required"); return false; }
    if (password.length < 6) { setAuthError("Password must be 6+ characters"); return false; }
    const newUser = { email, name, password, plan: "Basic", avatar: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() };
    setUser(newUser);
    setAuthError("");
    return true;
  };

  const logout = () => setUser(null);

  return <Ctx.Provider value={{ user, login, signup, logout, authError, setAuthError }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
