import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, ShieldCheck } from "lucide-react";
import { CONSENT_KEY, type ConsentValue } from "@/hooks/useCookieConsent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  function accept(level: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, level);
    setLeaving(true);
    setTimeout(() => setVisible(false), 350);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: leaving ? "translateY(100%)" : "translateY(0)",
        opacity: leaving ? 0 : 1,
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
      }}
    >
      <div
        style={{
          backgroundColor: "#18110C",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <ShieldCheck
            style={{ color: "#C04020", flexShrink: 0, marginTop: "2px" }}
            size={18}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
              We use essential cookies to keep you signed in and remember your preferences. With your consent we may also use analytics to improve the platform.{" "}
              <Link
                href="/cookie-settings"
                style={{ color: "#C04020", textDecoration: "underline", textUnderlineOffset: "2px" }}
              >
                Manage preferences
              </Link>{" "}
              or read our{" "}
              <Link
                href="/cookies"
                style={{ color: "#C04020", textDecoration: "underline", textUnderlineOffset: "2px" }}
              >
                Cookie Policy
              </Link>.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => accept("essential")}
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              Essential only
            </button>

            <button
              onClick={() => accept("all")}
              style={{
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#fff",
                background: "#C04020",
                border: "1px solid #C04020",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.opacity = "0.88")}
              onMouseLeave={e => ((e.target as HTMLElement).style.opacity = "1")}
            >
              Accept all
            </button>

            <button
              onClick={() => accept("essential")}
              aria-label="Dismiss cookie notice"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
