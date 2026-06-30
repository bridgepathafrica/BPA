import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Link } from "wouter";
import { ShieldCheck, BarChart2, Settings2, CheckCircle2, Circle, Save, RotateCcw } from "lucide-react";

const CONSENT_KEY = "bridgepath_cookie_consent";
type ConsentLevel = "all" | "essential";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

interface Category {
  id: "essential" | "analytics";
  icon: React.ReactNode;
  title: string;
  description: string;
  alwaysOn: boolean;
  examples: string[];
}

const categories: Category[] = [
  {
    id: "essential",
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Essential",
    description:
      "Strictly necessary for the platform to function. These cannot be disabled — without them you would not be able to sign in, navigate the dashboard, or submit a job application.",
    alwaysOn: true,
    examples: [
      "Authentication token — keeps you signed in",
      "User role — routes you to the correct dashboard",
      "Cookie consent preference — remembers this choice",
    ],
  },
  {
    id: "analytics",
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Analytics",
    description:
      "Help us understand how the platform is used in aggregate so we can improve navigation, hiring flows, and content. No personal profiles are built and data is never sold to third parties.",
    alwaysOn: false,
    examples: [
      "Page view counts (aggregate, anonymised)",
      "Feature usage metrics",
      "Error rate monitoring",
    ],
  },
];

export default function CookieSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentLevel | null;
    setAnalyticsEnabled(stored === "all");
  }, []);

  function handleSave() {
    const level: ConsentLevel = analyticsEnabled ? "all" : "essential";
    localStorage.setItem(CONSENT_KEY, level);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    localStorage.removeItem(CONSENT_KEY);
    setAnalyticsEnabled(false);
    setSaved(false);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageSEO
        title="Cookie Settings | Bridgepath Africa"
        description="Manage your cookie and analytics preferences for Bridgepath Africa. Choose what data you share with us."
        path="/cookie-settings"
        noIndex={true}
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 section-ink">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] mb-4 text-accent">
              Privacy controls
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
              Cookie Settings
            </h1>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-2xl">
              Choose which categories of cookies and local storage you allow
              Bridgepath Africa to use. Your preferences are saved to your
              browser and apply immediately.
            </p>
          </div>
        </section>

        {/* Settings */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">

            {/* Category cards */}
            <div className="grid gap-4 mb-10">
              {categories.map((cat) => {
                const isOn = cat.alwaysOn || (cat.id === "analytics" && analyticsEnabled);

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border bg-card p-6 shadow-sm transition-all"
                    style={{
                      borderColor: isOn ? TERRACOTTA + "40" : undefined,
                      boxShadow: isOn ? `0 0 0 1px ${TERRACOTTA}20` : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: isOn ? TERRACOTTA + "18" : "var(--muted)",
                            color: isOn ? TERRACOTTA : "var(--muted-foreground)",
                          }}
                        >
                          {cat.icon}
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold" style={{ color: INK }}>
                              {cat.title}
                            </h2>
                            {cat.alwaysOn && (
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: TERRACOTTA + "18", color: TERRACOTTA }}
                              >
                                Always active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {cat.description}
                          </p>

                          {/* Examples */}
                          <ul className="mt-3 space-y-1">
                            {cat.examples.map((ex) => (
                              <li key={ex} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div
                                  className="h-1.5 w-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: isOn ? TERRACOTTA : "var(--muted-foreground)" }}
                                />
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Toggle */}
                      <div className="shrink-0 mt-1">
                        {cat.alwaysOn ? (
                          <CheckCircle2 className="h-6 w-6" style={{ color: TERRACOTTA }} />
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={analyticsEnabled}
                            aria-label={`${cat.title} cookies`}
                            onClick={() => setAnalyticsEnabled((v) => !v)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              backgroundColor: analyticsEnabled ? TERRACOTTA : "var(--border)",
                            }}
                          >
                            <span
                              className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                              style={{
                                transform: analyticsEnabled ? "translateX(20px)" : "translateX(4px)",
                              }}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save / reset row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
              <div>
                {saved ? (
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#16a34a" }}>
                    <CheckCircle2 className="h-4 w-4" />
                    Preferences saved successfully
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Changes take effect immediately and persist in your browser.{" "}
                    <Link href="/cookies" style={{ color: TERRACOTTA, textDecoration: "underline", textUnderlineOffset: "2px" }}>
                      Read our Cookie Policy
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset & re-prompt
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: TERRACOTTA }}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save preferences
                </button>
              </div>
            </div>

            {/* Info strip */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <ShieldCheck className="h-4 w-4" />,
                  label: "No cross-site tracking",
                  body: "We do not use third-party advertising networks or behavioural profiling.",
                },
                {
                  icon: <Circle className="h-4 w-4" />,
                  label: "No data sold",
                  body: "Your personal data is never sold to third parties, regardless of your consent level.",
                },
                {
                  icon: <Settings2 className="h-4 w-4" />,
                  label: "Change anytime",
                  body: "Return to this page or clear your browser's localStorage to update your choice.",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                  <div
                    className="flex items-center gap-2 mb-2 font-semibold text-sm"
                    style={{ color: TERRACOTTA }}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            {/* DPO contact */}
            <p className="mt-8 text-xs text-muted-foreground text-center">
              For data protection enquiries contact our Data Protection Officer at{" "}
              <a href="mailto:dpo@bridgepathnetwork.com" style={{ color: TERRACOTTA }}>
                dpo@bridgepathnetwork.com
              </a>
              . See also our{" "}
              <Link href="/privacy" style={{ color: TERRACOTTA }}>Privacy Policy</Link> and{" "}
              <Link href="/cookies" style={{ color: TERRACOTTA }}>Cookie Policy</Link>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
