import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { upsertProfile } from "@/lib/supabaseProfile";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Briefcase, Users, Globe, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isDemoEmail } from "@/lib/demoAuth";

const GREEN = "#D94F20";
const DARK = "#1C1917";

const steps = [
  { id: 1, title: "Company Info", icon: <Briefcase className="h-5 w-5" /> },
  { id: 2, title: "Team & Hiring", icon: <Users className="h-5 w-5" /> },
  { id: 3, title: "Locations & Goals", icon: <Globe className="h-5 w-5" /> },
];

const industryOptions = ["Technology", "Finance & Fintech", "Healthcare", "Manufacturing", "NGO / Non-Profit", "Education", "FMCG / Retail", "Logistics", "Energy & Oil", "Consulting", "Other"];
const sizeOptions = ["1–10 employees", "11–50 employees", "51–200 employees", "201–500 employees", "500+ employees"];
const hiringTypes = ["Full-time staff", "Contract / Freelance", "Interns", "Executive / C-Suite", "Remote workers", "EoR (Employment of Record)"];
const countryOptions = ["Ghana", "Nigeria", "South Africa", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "Senegal", "Zambia", "Other African countries", "Multiple countries"];

const DEMO_COMPANY = { name: "TechBridge Africa", website: "https://techbridge.africa", industry: "Technology", size: "51–200 employees" };
const DEMO_HIRING = { types: ["Full-time staff", "Contract / Freelance", "Remote workers"], urgency: "Within 1–3 months", roles: "Software Engineers, Data Analysts, Product Managers" };
const DEMO_LOCATIONS = ["Ghana", "Multiple countries"];

export default function EmployerOnboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const isDemo = isDemoEmail(user?.email);

  const [company, setCompany] = useState({ name: "", website: "", industry: "", size: "" });
  const [hiring, setHiring] = useState({ types: [] as string[], urgency: "", roles: "" });
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    if (isDemo) {
      setCompany(DEMO_COMPANY);
      setHiring(DEMO_HIRING);
      setLocations(DEMO_LOCATIONS);
    }
  }, [isDemo]);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const persist = async (markComplete: boolean) => {
    if (!user || isDemo) return;
    try {
      await upsertProfile({
        id: user.id,
        company_name: company.name || null,
        company_website: company.website || null,
        industry: company.industry || null,
        company_size: company.size || null,
      });
    } catch {
      toast({ variant: "destructive", title: "Could not save", description: "Try again from Profile later." });
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await persist(true);
    setSaving(false);
    setLocation("/dashboard/employer");
  };

  const handleNext = async () => {
    if (step < 3) {
      if (!isDemo) await persist(false);
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-lg" style={{ color: DARK }}>Bridgepath<span style={{ color: GREEN }}>Africa</span></span>
          <span className="text-[10px] italic text-gray-400">Shaping People. Strengthening Institutions.</span>
        </div>
        {isDemo ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: GREEN + "18", color: GREEN }}>
            <Sparkles className="h-3.5 w-3.5" /> Demo Tour
          </div>
        ) : (
          <button onClick={handleFinish} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Skip for now →
          </button>
        )}
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="border-b px-6 py-3 flex items-center gap-3" style={{ backgroundColor: DARK, borderColor: DARK }}>
          <Sparkles className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
          <p className="text-sm text-white">
            <span className="font-semibold">Demo mode:</span> You're exploring as <span style={{ color: GREEN }}>Kofi Mensah</span> at <span style={{ color: GREEN }}>TechBridge Africa</span>. Just click <span className="font-semibold">Next</span> to continue.
          </p>
        </div>
      )}

      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s.id ? "text-white shadow-md" : step > s.id ? "text-white" : "bg-gray-100 text-gray-400"}`}
                  style={{ backgroundColor: step === s.id ? DARK : step > s.id ? DARK + "90" : undefined }}>
                  {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-gray-800" : "text-gray-400"}`}>{s.title}</span>
                {i < steps.length - 1 && <div className="w-8 sm:w-16 h-px bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%`, backgroundColor: DARK }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Tell us about your company</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  {isDemo ? "Pre-filled demo company profile. Just click Next to continue." : "Helps us match you with the right talent. You can edit this anytime."}
                </p>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Company Name</label>
                    <Input
                      placeholder="Your company name"
                      value={company.name}
                      onChange={(e) => !isDemo && setCompany({ ...company, name: e.target.value })}
                      className="h-11 disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                      disabled={isDemo}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Website <span className="text-gray-400 font-normal">(optional)</span></label>
                    <Input
                      placeholder="https://yourcompany.com"
                      value={company.website}
                      onChange={(e) => !isDemo && setCompany({ ...company, website: e.target.value })}
                      className="h-11 disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                      disabled={isDemo}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Industry</label>
                    <div className="flex flex-wrap gap-2">
                      {industryOptions.map((ind) => (
                        <button
                          key={ind}
                          onClick={() => !isDemo && setCompany({ ...company, industry: ind })}
                          disabled={isDemo}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: company.industry === ind ? DARK : "white",
                            color: company.industry === ind ? "white" : isDemo ? "#bbb" : "#555",
                            borderColor: company.industry === ind ? DARK : "#e5e7eb",
                            opacity: isDemo && company.industry !== ind ? 0.5 : 1,
                          }}>
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Company Size</label>
                    <select
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                      value={company.size}
                      onChange={(e) => !isDemo && setCompany({ ...company, size: e.target.value })}
                      disabled={isDemo}
                    >
                      <option value="">Select size</option>
                      {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Hiring Needs</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  {isDemo ? "Pre-filled hiring preferences for this demo." : "Tell us what kind of talent you're looking for."}
                </p>
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Type of hiring</label>
                  <div className="flex flex-wrap gap-2">
                    {hiringTypes.map((t) => {
                      const selected = hiring.types.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => !isDemo && setHiring({ ...hiring, types: toggleArr(hiring.types, t) })}
                          disabled={isDemo}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: selected ? DARK : "white",
                            color: selected ? "white" : isDemo ? "#bbb" : "#555",
                            borderColor: selected ? DARK : "#e5e7eb",
                            opacity: isDemo && !selected ? 0.5 : 1,
                          }}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Hiring urgency</label>
                  <select
                    className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                    value={hiring.urgency}
                    onChange={(e) => !isDemo && setHiring({ ...hiring, urgency: e.target.value })}
                    disabled={isDemo}
                  >
                    <option value="">Select urgency</option>
                    {["Immediately (within 2 weeks)", "Within 1–3 months", "3–6 months", "Long-term pipeline"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Roles you're looking to fill <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input
                    placeholder="e.g. Software Engineers, HR Managers, Sales Reps..."
                    value={hiring.roles}
                    onChange={(e) => !isDemo && setHiring({ ...hiring, roles: e.target.value })}
                    className="h-11 disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                    disabled={isDemo}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Where are you hiring?</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  {isDemo ? "Pre-selected countries for this demo. Click Enter Dashboard to proceed." : "Select all countries where you'd like to hire or already have staff."}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {countryOptions.map((c) => {
                    const selected = locations.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => !isDemo && setLocations(toggleArr(locations, c))}
                        disabled={isDemo}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: selected ? GREEN : "white",
                          color: selected ? "white" : isDemo ? "#bbb" : "#555",
                          borderColor: selected ? GREEN : "#e5e7eb",
                          opacity: isDemo && !selected ? 0.5 : 1,
                        }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <div className="p-5 rounded-xl" style={{ backgroundColor: GREEN + "12", border: `1px solid ${GREEN}30` }}>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <strong style={{ color: DARK }}>Need Employment of Record (EoR)?</strong> We can legally employ your staff in any of these countries without you needing a local entity. Our team will reach out to set this up.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10">
            {isDemo ? (
              <div />
            ) : (
              <button
                onClick={() => step > 1 ? setStep(step - 1) : undefined}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-800"}`}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-md"
                  style={{ backgroundColor: DARK }}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                  style={{ backgroundColor: DARK }}
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    : <><CheckCircle2 className="h-4 w-4" /> {isDemo ? "Enter Dashboard" : "Go to Dashboard"}</>}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {isDemo
              ? "This is a demo — no data is saved. Create a real account to start hiring."
              : "You can always update these in your profile settings later."}
          </p>
        </div>
      </div>
    </div>
  );
}
