import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import { TOKEN_KEY } from "@/lib/auth";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";
const ROLE_KEY = "bridgepath_user_role";
const USER_KEY = "bridgepath_user";

type Status = "loading" | "success" | "error" | "already";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadyVerified) { setStatus("already"); return; }
        if (data.success) {
          // If the backend returned a session token, store it and auto-redirect
          if (data.token && data.user) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(ROLE_KEY, data.user.role);
            localStorage.setItem(USER_KEY, JSON.stringify({
              id: String(data.user.id),
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              emailVerified: true,
            }));
            const dest =
              data.user.role === "admin"
                ? "/admin"
                : data.user.role === "employer"
                  ? "/dashboard/employer"
                  : "/dashboard/jobseeker";
            // Small delay so user sees the success screen briefly
            setTimeout(() => window.location.replace(dest), 1800);
          }
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data.message ?? "Verification failed.");
        }
      })
      .catch(() => { setStatus("error"); setMessage("Network error — please try again."); });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-10 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {status === "loading" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: CORAL + "12" }}>
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: CORAL }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: CHARCOAL }}>Verifying your email…</h1>
            <p className="text-sm text-muted-foreground">Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#1F7A7815" }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: "#1F7A78" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Email verified!</h1>
            <p className="text-sm text-muted-foreground mb-2">Your account is now active.</p>
            <p className="text-sm text-muted-foreground mb-8">Taking you to your dashboard…</p>
            <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: CORAL }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </div>
          </>
        )}

        {status === "already" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: CORAL + "12" }}>
              <Mail className="h-8 w-8" style={{ color: CORAL }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Already verified</h1>
            <p className="text-sm text-muted-foreground mb-8">Your email has already been confirmed. You can sign straight in.</p>
            <Link href="/auth/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: CORAL }}>
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#ef444415" }}>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Verification failed</h1>
            <p className="text-sm text-muted-foreground mb-2">{message || "This link may have expired or already been used."}</p>
            <p className="text-sm text-muted-foreground mb-8">
              Try signing in and requesting a new verification email, or contact{" "}
              <a href="mailto:support@bridgepathnetwork.com" className="underline" style={{ color: CORAL }}>support</a>.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: CORAL }}>
              Back to sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
