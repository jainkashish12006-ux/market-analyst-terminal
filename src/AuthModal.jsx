import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Zap, TrendingUp } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";

export function AuthModal({ open, onClose }) {
  const { theme } = useTheme();
  const { login, signup, authError, setAuthError } = useAuth();
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const t = theme;

  const handle = async (e) => {
    e.preventDefault();
    setAuthError("");
    let ok = false;
    if (tab === "login") ok = login(form.email, form.password);
    else ok = signup(form.name, form.email, form.password);
    if (ok) onClose();
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: t.glass, border: `1px solid ${t.border}`,
    color: t.text, fontSize: 13, fontFamily: t.fontDisplay,
    outline: "none", transition: "border 0.2s",
    backdropFilter: "blur(8px)",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{
              width: 420, background: t.surface, borderRadius: 20,
              border: `1px solid ${t.borderAccent}`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${t.accentGlow}`,
              overflow: "hidden", backdropFilter: "blur(20px)",
            }}>
            {/* Header */}
            <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={16} color="#000" />
                </div>
                <div>
                  <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 800, color: t.text, letterSpacing: "0.05em" }}>OMNI TERMINAL</div>
                  <div style={{ fontSize: 10, color: t.textSub, fontFamily: t.fontMono }}>Market Intelligence Platform</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", margin: "20px 28px 0", background: t.glass, borderRadius: 10, padding: 3 }}>
              {["login","signup"].map(tab_ => (
                <button key={tab_} onClick={() => { setTab(tab_); setAuthError(""); }}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: tab === tab_ ? t.accent : "transparent",
                    color: tab === tab_ ? "#000" : t.textSub,
                    fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em", transition: "all 0.2s" }}>
                  {tab_ === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handle} style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
              {tab === "signup" && (
                <div>
                  <label style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, display: "block", marginBottom: 5 }}>Full Name</label>
                  <input style={inp} placeholder="Alex Rivera" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, display: "block", marginBottom: 5 }}>Email</label>
                <input style={inp} type="email" placeholder="you@omni.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, display: "block", marginBottom: 5 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...inp, paddingRight: 42 }} type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              {authError && (
                <div style={{ fontSize: 11, color: t.red, fontFamily: t.fontDisplay,
                  background: `${t.red}15`, padding: "8px 12px", borderRadius: 8 }}>
                  {authError}
                </div>
              )}
              <button type="submit" style={{
                marginTop: 4, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
                color: "#000", fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 800,
                letterSpacing: "0.08em", transition: "opacity 0.2s",
              }}>
                {tab === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
              </button>
              {tab === "login" && (
                <div style={{ textAlign: "center", fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>
                  Demo: demo@omni.com / demo123
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
