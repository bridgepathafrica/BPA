import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["", "#ef4444", "#f59e0b", "#f59e0b", "#1F7A78"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : "#e5e7eb" }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

type PageStatus = "form" | "success" | "error";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PageStatus>("form");
  const [tokenError, setTokenError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setStatus("error");
      setTokenError("No reset token found. Please request a new password reset link.");
      return;
    }
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    if (!password || password.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setFieldError("Password must contain at least one letter and one number.");
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldError(data.message || "Reset failed. The link may have expired.");
        return;
      }
      if (data.token && data.user) {
        login(data.token, data.user);
        const dest = data.user.role === "admin" ? "/admin" : data.user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker";
        setLocation(dest);
        return;
      }
      setStatus("success");
    } catch {
      setFieldError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div
          className="w-full max-w-md rounded-2xl border border-border p-8 bg-card text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#ef444415" }}>
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Link expired</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{tokenError}</p>
          <Link href="/auth/forgot-password"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl text-white font-bold text-sm"
            style={{ backgroundColor: CORAL }}>
            Request a new link <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div
          className="w-full max-w-md rounded-2xl border border-border p-8 bg-card text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#1F7A7815" }}>
            <CheckCircle2 className="h-7 w-7" style={{ color: "#1F7A78" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Password updated</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
          <Link href="/auth/login"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl text-white font-bold text-sm"
            style={{ backgroundColor: CORAL }}>
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-border p-8 bg-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-7 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: CORAL + "14" }}>
          <Lock className="h-7 w-7" style={{ color: CORAL }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Choose a new password</h1>
        <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
          Pick something strong — at least 8 characters with a mix of letters and numbers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">New password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-11 pr-11 rounded-xl"
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <StrengthBar password={password} />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 pl-11 rounded-xl"
                autoComplete="new-password"
              />
            </div>
            {confirm && password !== confirm && (
              <p className="text-xs text-destructive mt-1.5">Passwords do not match</p>
            )}
          </div>

          {fieldError && (
            <p className="text-sm text-destructive">{fieldError}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 font-bold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-1 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: CORAL }}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating password…</>
              : <>Set new password <ArrowRight className="h-4 w-4" /></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
