import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    if (!email.trim() || !email.includes("@")) {
      setFieldError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.devLink) setDevLink(data.devLink);
      setSent(true);
    } catch {
      setFieldError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

        {!sent ? (
          <>
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: CORAL + "14" }}
            >
              <Mail className="h-7 w-7" style={{ color: CORAL }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Enter the email address for your Bridgepath Africa account and we'll send you a secure reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-xl"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                {fieldError && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 font-bold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-1 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: CORAL }}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-bold hover:underline" style={{ color: CORAL }}>
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: "#1F7A7815" }}
            >
              <CheckCircle2 className="h-7 w-7" style={{ color: "#1F7A78" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              If <strong className="text-foreground">{email}</strong> is registered with Bridgepath Africa,
              you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              The link expires in 1 hour. Check your spam folder if you don't see it.
            </p>

            {devLink && (
              <div className="mb-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700 mb-1.5">🧪 Dev mode — no email sent</p>
                <a
                  href={devLink}
                  className="text-xs font-semibold break-all underline text-amber-800 hover:text-amber-900"
                >
                  {devLink}
                </a>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSent(false); setEmail(""); setDevLink(null); }}
                className="text-sm font-semibold hover:underline text-left"
                style={{ color: CORAL }}
              >
                Try a different email
              </button>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
