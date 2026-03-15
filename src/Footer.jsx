import { useTheme } from "./ThemeContext";
import { TrendingUp, Github, Twitter, Linkedin, Shield, Zap } from "lucide-react";

export function Footer() {
  const { theme: t } = useTheme();

  const cols = [
    { label: "Platform", links: ["Dashboard","Performance","Market Watch","Anomaly Tracker","Global Map"] },
    { label: "Tools", links: ["Trade Story","Command Palette (⌘K)","Risk Calculator","Document Vault","Alert Preferences"] },
    { label: "Company", links: ["About Omni","Careers","Blog","Press Kit","Contact"] },
    { label: "Legal", links: ["Terms of Service","Privacy Policy","Cookie Policy","Regulatory Info","Disclosures"] },
  ];

  return (
    <footer style={{
      background: t.name === "deepSea" ? "rgba(5,8,16,0.97)" : "rgba(235,240,232,0.97)",
      backdropFilter: "blur(16px)",
      borderTop: `1px solid ${t.border}`,
      padding: "32px 32px 20px",
      marginTop: "auto",
    }}>
      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "220px repeat(4,1fr)", gap: 24, marginBottom: 28 }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="#000" />
            </div>
            <span style={{ fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 800,
              color: t.text, letterSpacing: "0.08em" }}>OMNI TERMINAL</span>
          </div>
          <p style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay, lineHeight: 1.6, marginBottom: 14 }}>
            Professional-grade market intelligence. Built for traders, analysts, and informed investors.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <button key={i} style={{ width: 28, height: 28, borderRadius: 7,
                background: t.glass, backdropFilter: "blur(6px)",
                border: `1px solid ${t.border}`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.textSub, transition: "all 0.15s" }}>
                <Icon size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(col => (
          <div key={col.label}>
            <div style={{ fontSize: 10, fontWeight: 800, color: t.textDim, fontFamily: t.fontDisplay,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
              {col.label}
            </div>
            {col.links.map(link => (
              <div key={link} style={{ marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay,
                  cursor: "pointer", transition: "color 0.15s",
                  display: "inline-block" }}
                  onMouseEnter={e => e.target.style.color = t.accent}
                  onMouseLeave={e => e.target.style.color = t.textSub}>
                  {link}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontDisplay }}>
            © 2025 Omni Terminal Inc. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Shield size={10} color={t.green} />
            <span style={{ fontSize: 10, color: t.green, fontFamily: t.fontMono }}>SEC Registered</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontDisplay }}>
            Market data delayed 15 min · For informational purposes only
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.green,
              boxShadow: `0 0 6px ${t.green}`, animation: "dotPulse 2s infinite" }} />
            <span style={{ fontSize: 10, fontFamily: t.fontMono, color: t.green }}>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
