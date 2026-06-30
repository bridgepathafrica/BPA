import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Loader2, Briefcase, User as UserIcon, ArrowLeft, CheckCircle2,
  ArrowRight, Mail, Lock, Eye, EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CORAL = "#C04020";
const NAVY = "#0D1E38";
const CHARCOAL = "#1C1917";

type Step = "role" | "details";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const color = score <= 1 ? "#ef4444" : score <= 3 ? "#f59e0b" : "#1F7A78";
  return { score, label, color };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? color : "#e5e7eb" }} />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
    </div>
  );
}

export default function Signup() {
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "employer" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);
  const [hasGoogle, setHasGoogle] = useState(false);
  const { signUpWithPassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role === "employer" || role === "job_seeker") { setSelectedRole(role); setStep("details"); }
    const error = params.get("error");
    if (error) toast({ variant: "destructive", title: "Sign-in error", description: error });
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((d) => setHasGoogle((d?.providers ?? []).includes("google")))
      .catch(() => {});
  }, []);

  const pwStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast({ variant: "destructive", title: "Name required" }); return; }
    if (!email.trim() || !email.includes("@")) { toast({ variant: "destructive", title: "Invalid email" }); return; }
    if (!password) { toast({ variant: "destructive", title: "Password required" }); return; }
    if (pwStrength.score < 2) {
      toast({ variant: "destructive", title: "Password too weak", description: "Add uppercase letters, numbers, or symbols." });
      return;
    }
    if (!selectedRole) { toast({ variant: "destructive", title: "Choose account type" }); return; }
    setIsLoading(true);
    const result = await signUpWithPassword(email.trim(), password, name.trim(), selectedRole);
    setIsLoading(false);
    if (result.error) {
      toast({ variant: "destructive", title: "Could not create account", description: result.error });
      return;
    }
    if (result.devVerificationLink) setDevVerificationLink(result.devVerificationLink);
    setRegistered(true);
  };

  const accentColor = selectedRole === "employer" ? CORAL : NAVY;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060D18 0%, #0A1628 45%, #0D1E38 100%)" }}>

      {/* Ambient blobs — brand palette */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C04020 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F0A010 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute top-[30%] left-[20%] w-[280px] h-[280px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #1F7A78 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative w-full" style={{ maxWidth: step === "role" ? 600 : 440 }}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Role Selection ── */}
          {step === "role" && (
            <motion.div key="role"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

              <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
                <div className="bg-white rounded-2xl m-[1px]">

                  <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: CORAL }}>
                        <img src="/logo-b.png" alt="Bridgepath Africa" width="22" height="22"
                          className="h-[22px] w-[22px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                      </div>
                      <span className="font-bold text-[15px]" style={{ color: CHARCOAL }}>
                        Bridgepath<span style={{ color: CORAL }}> Africa</span>
                      </span>
                    </Link>
                    <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: CHARCOAL }}>Join Bridgepath Africa</h1>
                    <p className="text-sm text-gray-500 mt-1">Choose how you'll use the platform.</p>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-4">
                    {/* Employer card */}
                    <button type="button"
                      onClick={() => { setSelectedRole("employer"); setStep("details"); }}
                      className="group relative rounded-2xl border-2 border-gray-100 p-6 text-left hover:border-transparent hover:shadow-xl transition-all duration-200"
                      style={{}} onMouseEnter={(e) => { e.currentTarget.style.borderColor = CORAL + "50"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; }}>
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200"
                        style={{ backgroundColor: CORAL + "12" }}>
                        <Briefcase className="h-6 w-6" style={{ color: CORAL }} />
                      </div>
                      <h2 className="font-bold text-base mb-1.5" style={{ color: CHARCOAL }}>I'm an Employer</h2>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">Post roles, discover Africa's top talent and build your team.</p>
                      <ul className="space-y-1.5">
                        {["Post jobs & reach talent", "Pre-screened candidates", "Pan-African reach"].map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: CORAL }} /> {item}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold" style={{ color: CORAL }}>
                        Get started <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>

                    {/* Job seeker card */}
                    <button type="button"
                      onClick={() => { setSelectedRole("job_seeker"); setStep("details"); }}
                      className="group relative rounded-2xl border-2 border-gray-100 p-6 text-left hover:shadow-xl transition-all duration-200"
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = NAVY + "50"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; }}>
                      <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200"
                        style={{ backgroundColor: NAVY + "10" }}>
                        <UserIcon className="h-6 w-6" style={{ color: NAVY }} />
                      </div>
                      <h2 className="font-bold text-base mb-1.5" style={{ color: CHARCOAL }}>I'm a Professional</h2>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">Find jobs across Africa, get AI CV feedback and track applications.</p>
                      <ul className="space-y-1.5">
                        {["Browse vetted opportunities", "Free AI CV analysis", "One-click apply"].map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: NAVY }} /> {item}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold" style={{ color: NAVY }}>
                        Get started <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  </div>

                  <div className="px-6 pb-6">
                    <p className="text-center text-[13px] text-gray-400">
                      Already have an account?{" "}
                      <Link href="/auth/login" className="font-bold hover:underline" style={{ color: CORAL }}>Sign in</Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Details Form ── */}
          {step === "details" && (
            <motion.div key="details"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

              <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
                <div className="bg-white rounded-2xl m-[1px]">

                  {/* Header */}
                  <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                    {!registered && (
                      <button type="button" onClick={() => { setStep("role"); setSelectedRole(null); }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 mb-5 transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </button>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <Link href="/" className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: CORAL }}>
                          <img src="/logo-b.png" alt="Bridgepath Africa" width="22" height="22"
                            className="h-[22px] w-[22px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                        </div>
                        <span className="font-bold text-[15px]" style={{ color: CHARCOAL }}>
                          Bridgepath<span style={{ color: CORAL }}> Africa</span>
                        </span>
                      </Link>
                      {!registered && (
                        <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: accentColor + "12", color: accentColor }}>
                          {selectedRole === "employer" ? <Briefcase className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                          {selectedRole === "employer" ? "Employer" : "Professional"}
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: CHARCOAL }}>
                      {registered ? "Check your inbox" : "Create your account"}
                    </h1>
                    {!registered && <p className="text-sm text-gray-500 mt-1">Free to join — takes 30 seconds.</p>}
                  </div>

                  <div className="px-8 py-7">
                    {registered ? (
                      /* ── Success state ── */
                      <div className="text-center py-2">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                          style={{ backgroundColor: CORAL + "12" }}>
                          <Mail className="h-7 w-7" style={{ color: CORAL }} />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">We sent a verification link to</p>
                        <p className="text-sm font-bold text-gray-800 mb-4">{email}</p>
                        <p className="text-xs text-gray-400 mb-7 leading-relaxed">Click the link to activate your account. It expires in 24 hours.</p>

                        {/* Dev-mode shortcut: show the verification link when email isn't configured */}
                        {devVerificationLink && (
                          <div className="mb-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-left">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1.5">Dev mode — email not configured</p>
                            <p className="text-xs text-amber-600 mb-2 leading-relaxed">No email service is set up. Use this link to verify your account now:</p>
                            <a href={devVerificationLink}
                              className="block text-xs font-semibold break-all underline"
                              style={{ color: CORAL }}>
                              {devVerificationLink}
                            </a>
                          </div>
                        )}

                        <Link href="/auth/login"
                          className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl text-white text-sm font-bold shadow-lg"
                          style={{ backgroundColor: CORAL, boxShadow: `0 4px 20px ${CORAL}40` }}>
                          Go to sign in <ArrowRight className="h-4 w-4" />
                        </Link>
                        <p className="text-xs text-gray-400 mt-5">
                          Didn't receive it?{" "}
                          <button type="button"
                            onClick={async () => {
                              await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
                              toast({ title: "Sent!", description: "A new verification email has been sent." });
                            }}
                            className="font-bold underline" style={{ color: CORAL }}>
                            Resend it
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Google button — only shown when provider is configured */}
                        {hasGoogle && (
                          <>
                            <a href={`/api/auth/google?role=${selectedRole ?? "job_seeker"}`}
                              className="flex items-center justify-center gap-3 w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all font-semibold text-gray-700 text-sm">
                              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Sign up with Google
                            </a>

                            {/* Divider */}
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                              <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">or</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSignUp} className="space-y-4">
                          <div>
                            <label className="text-[13px] font-semibold text-gray-700 block mb-1.5">
                              {selectedRole === "employer" ? "Company or full name" : "Full name"}
                            </label>
                            <Input
                              placeholder={selectedRole === "employer" ? "Acme Corp or Your Name" : "Your full name"}
                              value={name} onChange={(e) => setName(e.target.value)}
                              className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 text-sm"
                              style={{ "--tw-ring-color": accentColor + "30" } as React.CSSProperties}
                              autoFocus />
                          </div>
                          <div>
                            <label className="text-[13px] font-semibold text-gray-700 block mb-1.5">Email address</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="email" placeholder="name@example.com" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 pl-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 text-sm"
                                style={{ "--tw-ring-color": accentColor + "30" } as React.CSSProperties} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[13px] font-semibold text-gray-700 block mb-1.5">Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type={showPassword ? "text" : "password"} placeholder="At least 8 characters"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="h-11 pl-10 pr-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 text-sm"
                                style={{ "--tw-ring-color": accentColor + "30" } as React.CSSProperties}
                                autoComplete="new-password" />
                              <button type="button" onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <PasswordStrengthMeter password={password} />
                          </div>

                          <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                            className="w-full h-11 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 text-sm shadow-lg"
                            style={{ backgroundColor: accentColor, boxShadow: `0 4px 20px ${accentColor}40` }}>
                            {isLoading
                              ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                              : <>Create account <ArrowRight className="h-4 w-4" /></>}
                          </motion.button>

                          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                            By creating an account you agree to our{" "}
                            <Link href="/legal" className="underline hover:text-gray-600">Terms</Link> and{" "}
                            <Link href="/legal" className="underline hover:text-gray-600">Privacy Policy</Link>.
                          </p>
                        </form>

                        <p className="text-center text-[13px] text-gray-400 pt-1">
                          Already have an account?{" "}
                          <Link href="/auth/login" className="font-bold hover:underline" style={{ color: CORAL }}>Sign in</Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/30 mt-5">
          © {new Date().getFullYear()} Bridgepath Africa · <a href="/legal" className="hover:text-white/50 underline">Terms</a> · <a href="/legal" className="hover:text-white/50 underline">Privacy</a>
        </p>
      </div>
    </div>
  );
}
