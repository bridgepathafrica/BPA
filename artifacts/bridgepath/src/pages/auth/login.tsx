import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DEMO_JOBSEEKER, DEMO_EMPLOYER } from "@/lib/demoAuth";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";

export default function Login() {
  const { signInWithPassword } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"jobseeker" | "employer" | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error) toast({ variant: "destructive", title: "Sign-in error", description: error });
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((d) => setHasGoogle((d?.providers ?? []).includes("google")))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { toast({ variant: "destructive", title: "Invalid email" }); return; }
    if (!password) { toast({ variant: "destructive", title: "Password required" }); return; }
    setIsLoading(true);
    const result = await signInWithPassword(email.trim(), password);
    setIsLoading(false);
    if (result.error) {
      if (result.error.includes("EmailNotVerified") || result.error.includes("verify your email")) {
        setUnverifiedEmail(email.trim());
      } else {
        toast({ variant: "destructive", title: "Could not sign in", description: result.error });
      }
      return;
    }
    toast({ title: "Welcome back", description: "Signed in to Bridgepath Africa." });
    const dest = result.role === "admin" ? "/admin" : result.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker";
    setLocation(dest);
  };

  const handleDemoLogin = async (type: "jobseeker" | "employer") => {
    setDemoLoading(type);
    const demo = type === "jobseeker" ? DEMO_JOBSEEKER : DEMO_EMPLOYER;
    const result = await signInWithPassword(demo.email, demo.password);
    setDemoLoading(null);
    if (result.error) { toast({ variant: "destructive", title: "Demo login failed", description: result.error }); return; }
    setLocation(type === "employer" ? "/onboarding/employer" : "/onboarding/jobseeker");
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: unverifiedEmail }) });
    setResendLoading(false);
    toast({ title: "Verification email sent", description: `Check your inbox at ${unverifiedEmail}` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060D18 0%, #0A1628 45%, #0D1E38 100%)" }}>

      {/* Ambient blobs — brand palette */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #C04020 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F0A010 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #1F7A78 0%, transparent 70%)", filter: "blur(60px)" }} />

      <motion.div
        className="relative w-full max-w-[420px]"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Floating card */}
        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>

          {/* Card inner — white surface */}
          <div className="bg-white rounded-2xl m-[1px]">

            {/* Header strip */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: CORAL }}>
                  <img src="/logo-b.png" alt="Bridgepath Africa" width="22" height="22"
                    className="h-[22px] w-[22px] object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                </div>
                <span className="font-bold text-[15px]" style={{ color: CHARCOAL }}>
                  Bridgepath<span style={{ color: CORAL }}> Africa</span>
                </span>
              </Link>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: CHARCOAL }}>Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue.</p>
            </div>

            <div className="px-8 py-7 space-y-5">

              {/* Unverified email banner */}
              {unverifiedEmail && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border p-3.5 text-sm"
                  style={{ borderColor: CORAL + "40", backgroundColor: CORAL + "08" }}>
                  <p className="font-semibold text-[13px] mb-1" style={{ color: CHARCOAL }}>Email not verified</p>
                  <p className="text-gray-500 text-xs mb-2.5">
                    Check <strong>{unverifiedEmail}</strong> for your verification link.
                  </p>
                  <button onClick={handleResendVerification} disabled={resendLoading}
                    className="text-xs font-bold underline disabled:opacity-50 transition-opacity" style={{ color: CORAL }}>
                    {resendLoading ? "Sending…" : "Resend verification email"}
                  </button>
                </motion.div>
              )}

              {/* Google button — only shown when the provider is configured */}
              {hasGoogle && (
                <>
                  <a href="/api/auth/google?role=job_seeker"
                    className="flex items-center justify-center gap-3 w-full h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all font-semibold text-gray-700 text-sm">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
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

              {/* Email + password form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-gray-700 block mb-1.5">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-coral transition-colors" />
                    <Input type="email" placeholder="name@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 text-sm transition-all"
                      style={{ "--tw-ring-color": CORAL + "30" } as React.CSSProperties}
                      autoComplete="email" autoFocus />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-semibold text-gray-700">Password</label>
                    <Link href="/auth/forgot-password"
                      className="text-[11px] font-semibold hover:underline transition-colors" style={{ color: CORAL }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Your password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 text-sm transition-all"
                      style={{ "--tw-ring-color": CORAL + "30" } as React.CSSProperties}
                      autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                  className="w-full h-11 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 text-sm shadow-lg mt-1"
                  style={{ backgroundColor: CORAL, boxShadow: `0 4px 20px ${CORAL}40` }}>
                  {isLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                    : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>

              <p className="text-center text-[13px] text-gray-400">
                No account?{" "}
                <Link href="/auth/signup" className="font-bold hover:underline transition-colors" style={{ color: CORAL }}>
                  Create one free
                </Link>
              </p>
            </div>

            {/* Demo bar */}
            <div className="border-t border-gray-100 px-8 py-5" style={{ backgroundColor: "#FAFAFA" }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Try a live demo — no sign-up</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => handleDemoLogin("employer")} disabled={!!demoLoading}
                  className="text-left rounded-lg px-3 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-60 group">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: CORAL }}>K</div>
                    <span className="text-xs font-bold" style={{ color: CHARCOAL }}>Employer</span>
                    {demoLoading === "employer" ? <Loader2 className="h-3 w-3 animate-spin text-gray-400 ml-auto" /> : <ArrowRight className="h-3 w-3 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />}
                  </div>
                  <p className="text-[10px] text-gray-400 pl-7">Kofi Mensah · TechBridge</p>
                </button>
                <button type="button" onClick={() => handleDemoLogin("jobseeker")} disabled={!!demoLoading}
                  className="text-left rounded-lg px-3 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-60 group">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: "#0D1E38" }}>A</div>
                    <span className="text-xs font-bold" style={{ color: CHARCOAL }}>Job Seeker</span>
                    {demoLoading === "jobseeker" ? <Loader2 className="h-3 w-3 animate-spin text-gray-400 ml-auto" /> : <ArrowRight className="h-3 w-3 text-gray-300 ml-auto group-hover:translate-x-0.5 transition-transform" />}
                  </div>
                  <p className="text-[10px] text-gray-400 pl-7">Ama Boateng · Engineer</p>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/30 mt-5">
          © {new Date().getFullYear()} Bridgepath Africa · <a href="/legal" className="hover:text-white/50 underline">Terms</a> · <a href="/legal" className="hover:text-white/50 underline">Privacy</a>
        </p>
      </motion.div>
    </div>
  );
}
