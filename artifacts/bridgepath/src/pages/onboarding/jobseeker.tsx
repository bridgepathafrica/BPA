import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { upsertProfile } from "@/lib/supabaseProfile";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, User, Briefcase, MapPin, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isDemoEmail } from "@/lib/demoAuth";

const GREEN = "#D94F20";
const DARK = "#1C1917";

const steps = [
  { id: 1, title: "Personal Info", icon: <User className="h-5 w-5" /> },
  { id: 2, title: "Skills & Experience", icon: <Briefcase className="h-5 w-5" /> },
  { id: 3, title: "Job Preferences", icon: <MapPin className="h-5 w-5" /> },
];

const skillOptions = ["Software Engineering", "Data Science", "Finance", "HR & Recruitment", "Marketing", "Product Management", "Design", "Sales", "Operations", "Healthcare", "Legal", "Education"];
const locationOptions = ["Accra, Ghana", "Lagos, Nigeria", "Johannesburg, South Africa", "Kampala, Uganda", "Dar es Salaam, Tanzania", "Remote", "Any Location in Africa", "Open to Relocation"];
const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

const DEMO_INFO = {
  bio: "Passionate software engineer with 5 years of experience building scalable fintech and data platforms across Africa. Skilled in Python, React, and cloud architecture — currently seeking remote roles with global employers.",
  location: "Accra, Ghana",
  linkedin: "https://linkedin.com/in/ama-boateng",
};
const DEMO_SKILLS = ["Software Engineering", "Data Science", "Finance"];
const DEMO_EXPERIENCE = "3–5 years";
const DEMO_PREFS = {
  locations: ["Accra, Ghana", "Remote", "Any Location in Africa"],
  types: ["Full-time", "Contract"],
  salary: "$4,000 – $7,000 / month",
};

export default function JobSeekerOnboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const isDemo = isDemoEmail(user?.email);

  const [info, setInfo] = useState({ bio: "", location: "", linkedin: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [prefs, setPrefs] = useState({ locations: [] as string[], types: [] as string[], salary: "" });

  useEffect(() => {
    if (isDemo) {
      setInfo(DEMO_INFO);
      setSkills(DEMO_SKILLS);
      setExperience(DEMO_EXPERIENCE);
      setPrefs(DEMO_PREFS);
    }
  }, [isDemo]);

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const persist = async (markComplete: boolean) => {
    if (!user || isDemo) return;
    try {
      await upsertProfile({
        id: user.id,
        bio: info.bio || null,
        location: info.location || null,
        linkedin_url: info.linkedin || null,
        skills,
        experience: experience || null,
      });
    } catch {
      toast({ variant: "destructive", title: "Could not save", description: "Try again from Profile later." });
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await persist(true);
    setSaving(false);
    setLocation(isDemo ? "/dashboard/jobseeker" : "/dashboard/jobseeker");
  };

  const handleNext = async () => {
    if (step < 3) {
      if (!isDemo) await persist(false);
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8faf5" }}>
      {/* Header */}
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
            <span className="font-semibold">Demo mode:</span> You're exploring as <span style={{ color: GREEN }}>Ama Boateng</span>. All data is pre-filled — just click <span className="font-semibold">Next</span> to continue.
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s.id ? "text-white shadow-md" : step > s.id ? "text-white" : "bg-gray-100 text-gray-400"}`}
                  style={{ backgroundColor: step === s.id ? GREEN : step > s.id ? GREEN + "80" : undefined }}>
                  {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-gray-800" : "text-gray-400"}`}>{s.title}</span>
                {i < steps.length - 1 && <div className="w-8 sm:w-16 h-px bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / steps.length) * 100}%`, backgroundColor: GREEN }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Tell us about yourself</h2>
                <p className="text-gray-500 mb-8 text-sm">
                  {isDemo ? "Here's your pre-filled demo profile — just click Next to continue." : "Helps employers find you faster. You can always edit this later."}
                </p>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Short Bio</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Passionate software engineer with 5 years of experience in fintech..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      value={info.bio}
                      onChange={(e) => setInfo({ ...info, bio: e.target.value })}
                      disabled={isDemo}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Current Location</label>
                    <Input
                      placeholder="e.g. Accra, Ghana"
                      value={info.location}
                      onChange={(e) => setInfo({ ...info, location: e.target.value })}
                      className="h-11 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      disabled={isDemo}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">LinkedIn Profile <span className="text-gray-400 font-normal">(optional)</span></label>
                    <Input
                      placeholder="https://linkedin.com/in/yourname"
                      value={info.linkedin}
                      onChange={(e) => setInfo({ ...info, linkedin: e.target.value })}
                      className="h-11 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                      disabled={isDemo}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Skills &amp; Experience</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  {isDemo ? "Pre-selected skills for this demo profile." : "Select the areas you work in. Pick all that apply."}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {skillOptions.map((skill) => {
                    const selected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => !isDemo && setSkills(toggleArr(skills, skill))}
                        disabled={isDemo}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: selected ? GREEN : "white",
                          color: selected ? "white" : isDemo ? "#bbb" : "#555",
                          borderColor: selected ? GREEN : "#e5e7eb",
                          opacity: isDemo && !selected ? 0.5 : 1,
                        }}>
                        {skill}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Years of Experience</label>
                  <select
                    className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                    value={experience}
                    onChange={(e) => !isDemo && setExperience(e.target.value)}
                    disabled={isDemo}
                  >
                    <option value="">Select years</option>
                    {["0–1 years (Entry level)", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: DARK }}>Job Preferences</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  {isDemo ? "Pre-set preferences for this demo. Click Complete Setup to see your dashboard." : "Tell us what kind of opportunities you're looking for."}
                </p>
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Preferred Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {locationOptions.map((loc) => {
                      const selected = prefs.locations.includes(loc);
                      return (
                        <button
                          key={loc}
                          onClick={() => !isDemo && setPrefs({ ...prefs, locations: toggleArr(prefs.locations, loc) })}
                          disabled={isDemo}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: selected ? GREEN : "white",
                            color: selected ? "white" : isDemo ? "#bbb" : "#555",
                            borderColor: selected ? GREEN : "#e5e7eb",
                            opacity: isDemo && !selected ? 0.5 : 1,
                          }}>
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 block mb-2">Job Type</label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypeOptions.map((t) => {
                      const selected = prefs.types.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => !isDemo && setPrefs({ ...prefs, types: toggleArr(prefs.types, t) })}
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
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Expected Salary <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input
                    placeholder="e.g. $3,000 – $5,000 / month"
                    value={prefs.salary}
                    onChange={(e) => !isDemo && setPrefs({ ...prefs, salary: e.target.value })}
                    className="h-11 disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isDemo}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
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
                  style={{ backgroundColor: GREEN }}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-60"
                  style={{ backgroundColor: GREEN }}
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    : <><CheckCircle2 className="h-4 w-4" /> {isDemo ? "Enter Dashboard" : "Complete Setup"}</>}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            {isDemo
              ? "This is a demo — no data is saved. Create a real account to save your profile."
              : "You can always update these in your profile settings later."}
          </p>
        </div>
      </div>
    </div>
  );
}
