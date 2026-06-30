import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { TOKEN_KEY } from "@/lib/auth";

const ROLE_KEY = "bridgepath_user_role";
const USER_KEY = "bridgepath_user";

export default function OAuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role") ?? "job_seeker";
    const error = params.get("error");

    if (error) {
      setLocation(`/auth/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      setLocation("/auth/login?error=OAuth+sign-in+failed");
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const apiUser = data?.user;
        if (apiUser?.id) {
          const appUser = {
            id: String(apiUser.id),
            email: apiUser.email,
            name: apiUser.name,
            role: apiUser.role,
            emailVerified: apiUser.emailVerified,
          };
          localStorage.setItem(USER_KEY, JSON.stringify(appUser));
          localStorage.setItem(ROLE_KEY, apiUser.role);
        }
        const effectiveRole = apiUser?.role ?? role;
        const dest =
          effectiveRole === "admin"
            ? "/admin"
            : effectiveRole === "employer"
              ? "/dashboard/employer"
              : "/dashboard/jobseeker";
        window.location.replace(dest);
      })
      .catch(() => {
        const dest =
          role === "admin"
            ? "/admin"
            : role === "employer"
              ? "/dashboard/employer"
              : "/dashboard/jobseeker";
        window.location.replace(dest);
      });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
