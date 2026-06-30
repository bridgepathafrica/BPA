import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";

type Status = "loading" | "success" | "error";

export default function MagicLinkVerify() {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("No magic link token found. Please request a new link.");
      return;
    }

    fetch(`/api/auth/magic-link/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setErrorMsg(data.message ?? "This link is invalid or has expired.");
          return;
        }
        if (data.token && data.user) {
          login(data.token, data.user);
          setTimeout(() => {
            const dest = data.user.role === "admin" ? "/admin" : data.user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker";
            setLocation(dest);
          }, 800);
          setStatus("success");
          return;
        }
        setStatus("error");
        setErrorMsg("Unexpected response. Please try again.");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error — please try again.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-border p-10 bg-card text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {status === "loading" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: CORAL + "12" }}>
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: CORAL }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: CHARCOAL }}>Signing you in…</h1>
            <p className="text-sm text-muted-foreground">Verifying your magic link. Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#1F7A7815" }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: "#1F7A78" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>You're in!</h1>
            <p className="text-sm text-muted-foreground mb-3">Signed in successfully. Redirecting to your dashboard…</p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#ef444415" }}>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: CHARCOAL }}>Link expired</h1>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {errorMsg || "This magic link is invalid or has already been used."}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Magic links expire after 30 minutes and can only be used once.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: CORAL }}>
                <Zap className="h-4 w-4" />
                Request a new link
              </Link>
              <Link href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" /> Sign in with password
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
