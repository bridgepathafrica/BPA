import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, User, Building2, MapPin, Briefcase, GraduationCap,
  Linkedin, Globe, X, Plus, CheckCircle2, Link as LinkIcon,
  ChevronRight, Save, Camera, Lock, Eye, EyeOff, ShieldCheck,
  FileText, Upload, Mail, ArrowRight,
} from "lucide-react";

const API_BASE = "/api";
const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const TEAL = "#1F7A78";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("bridgepath_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const INDUSTRIES = [
  "Technology", "Banking & Finance", "FinTech", "Healthcare",
  "Engineering", "Telecommunications", "E-Commerce", "Manufacturing",
  "Advertising & Media", "NGO / Development", "Education", "Other",
];
const AFRICAN_COUNTRIES = [
  "Ghana", "Nigeria", "South Africa", "Tanzania", "Uganda",
  "Ethiopia", "Rwanda", "Senegal", "Côte d'Ivoire", "Cameroon", "Egypt",
  "Morocco", "Other",
];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

const jobSeekerSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  experience: z.string().optional(),
  education: z.string().optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const employerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  bio: z.string().max(800).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Za-z]/, "Must include a letter").regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Tab = "info" | "skills" | "links" | "security";

function ProfileStrength({ pct, label }: { pct: number; label: string }) {
  const color = pct < 40 ? "#f59e0b" : pct < 75 ? TEAL : TERRACOTTA;
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-gray-500">Profile strength</span>
        <span className="font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SkillChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
      style={{ borderColor: TERRACOTTA + "60", backgroundColor: TERRACOTTA + "12", color: TEAL }}>
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-red-100 hover:text-red-500 transition-colors">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const isEmployer = user?.role === "employer";

  const form = useForm({
    resolver: zodResolver((isEmployer ? employerSchema : jobSeekerSchema) as never),
    defaultValues: {
      bio: "", location: "", country: "", experience: "", education: "",
      linkedinUrl: "", portfolioUrl: "", companyName: "", companyWebsite: "",
      industry: "", companySize: "",
    },
  });

  const pwForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Email change state
  const [emailChanging, setEmailChanging] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailChangeResult, setEmailChangeResult] = useState<{ devLink?: string } | null>(null);

  // Connected accounts state
  const [hasGoogle, setHasGoogle] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [linkedLoading, setLinkedLoading] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const watchedValues = form.watch();

  /* ── Load profile ── */
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/profiles/${user.id}`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        form.reset({
          bio: data.bio || "",
          location: data.location || "",
          country: data.country || "",
          experience: data.experience || "",
          education: data.education || "",
          linkedinUrl: data.linkedinUrl || "",
          portfolioUrl: data.portfolioUrl || "",
          companyName: data.companyName || "",
          companyWebsite: data.companyWebsite || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
        });
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setAvatarUrl(data.avatarUrl || null);
        setCvUrl(data.resumeUrl || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  /* ── Profile completeness ── */
  const completeness = (() => {
    const v = watchedValues as Record<string, string>;
    if (isEmployer) {
      const fields = [v.companyName, v.country, v.bio, v.industry, v.companyWebsite, v.location];
      const filled = fields.filter(Boolean).length + (avatarUrl ? 1 : 0);
      return Math.round((filled / 7) * 100);
    }
    const fields = [v.bio, v.location, v.country, v.experience, v.education, v.linkedinUrl];
    const filled = fields.filter(Boolean).length + (skills.length > 0 ? 1 : 0) + (avatarUrl ? 1 : 0);
    return Math.round((filled / 8) * 100);
  })();
  const strengthLabel = completeness < 40 ? "Starter" : completeness < 70 ? "Good" : completeness < 90 ? "Strong" : "All Star";

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch(`${API_BASE}/uploads/avatar`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setAvatarUrl(data.url);
      toast({ title: "Photo updated", description: "Your profile photo is live." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  /* ── CV upload ── */
  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    try {
      const fd = new FormData();
      fd.append("cv", file);
      const res = await fetch(`${API_BASE}/uploads/cv`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setCvUrl(data.url);
      setCvFileName(data.fileName);
      await fetch(`${API_BASE}/profiles/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ resumeUrl: data.url }),
      });
      toast({ title: "CV uploaded", description: `${data.fileName} is linked to your profile.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setCvUploading(false);
      e.target.value = "";
    }
  };

  /* ── Skills input ── */
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput("");
  };
  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) setSkills(prev => prev.slice(0, -1));
  };

  /* ── Profile submit ── */
  const onSubmit = async (data: Record<string, string>) => {
    if (!user) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (isEmployer) {
        body.companyName = data.companyName;
        body.companyWebsite = data.companyWebsite || null;
        body.industry = data.industry || null;
        body.companySize = data.companySize || null;
        body.location = data.location || null;
        body.country = data.country;
        body.bio = data.bio || null;
      } else {
        body.bio = data.bio || null;
        body.location = data.location || null;
        body.country = data.country;
        body.skills = skills;
        body.experience = data.experience || null;
        body.education = data.education || null;
        body.linkedinUrl = data.linkedinUrl || null;
        body.portfolioUrl = data.portfolioUrl || null;
      }
      const res = await fetch(`${API_BASE}/profiles/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || "Failed to save");
      }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
      toast({ title: "Profile saved", description: "Your changes are live." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    }
    setSaving(false);
  };

  /* ── Load linked accounts + Google provider availability ── */
  useEffect(() => {
    if (tab !== "security") return;
    setLinkedLoading(true);
    Promise.all([
      fetch("/api/auth/providers").then(r => r.json()).catch(() => ({ providers: [] })),
      fetch("/api/auth/linked-accounts", { headers: authHeaders() }).then(r => r.json()).catch(() => ({ google: false })),
    ]).then(([providers, linked]) => {
      setHasGoogle((providers?.providers ?? []).includes("google"));
      setGoogleLinked(!!linked?.google);
    }).finally(() => setLinkedLoading(false));
  }, [tab]);

  /* ── Handle ?linked=google or ?link_error= return from OAuth ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get("linked");
    const linkError = params.get("link_error");
    if (linked === "google") {
      setGoogleLinked(true);
      setTab("security");
      toast({ title: "Google connected", description: "You can now sign in with Google." });
      window.history.replaceState({}, "", "/profile");
    }
    if (linkError) {
      setTab("security");
      toast({ variant: "destructive", title: "Linking failed", description: linkError });
      window.history.replaceState({}, "", "/profile");
    }
  }, []);

  /* ── Disconnect Google ── */
  const handleGoogleDisconnect = async () => {
    setUnlinking(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google/link`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as any).message || "Failed to disconnect");
      }
      setGoogleLinked(false);
      toast({ title: "Google disconnected", description: "Google has been removed from your account." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not disconnect", description: err.message });
    }
    setUnlinking(false);
  };

  /* ── Change email submit ── */
  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({ variant: "destructive", title: "Invalid email", description: "Enter a valid email address." });
      return;
    }
    if (!emailChangePassword) {
      toast({ variant: "destructive", title: "Password required", description: "Enter your current password to confirm." });
      return;
    }
    setEmailChanging(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ newEmail: newEmail.trim(), currentPassword: emailChangePassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to request email change");
      setEmailChangeResult({ devLink: json.devLink });
      setNewEmail("");
      setEmailChangePassword("");
      toast({ title: "Confirmation sent", description: "Check your new inbox for a confirmation link." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not change email", description: err.message });
    }
    setEmailChanging(false);
  };

  /* ── Change password submit ── */
  const onChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setPwSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to change password");
      pwForm.reset();
      toast({ title: "Password changed", description: "Your password has been updated successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not change password", description: err.message });
    }
    setPwSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = isEmployer
    ? [
        { id: "info", label: "Company Info", icon: Building2 },
        { id: "links", label: "Links", icon: LinkIcon },
        { id: "security", label: "Security", icon: ShieldCheck },
      ]
    : [
        { id: "info", label: "Personal Info", icon: User },
        { id: "skills", label: "Skills & CV", icon: Briefcase },
        { id: "links", label: "Links", icon: LinkIcon },
        { id: "security", label: "Security", icon: ShieldCheck },
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Profile header card ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div className="h-24 w-full" style={{ background: INK }} />
        <div className="px-6 pb-6 -mt-10">
          {/* Avatar with upload */}
          <div className="relative inline-block mb-4">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-white overflow-hidden"
              style={{ backgroundColor: TERRACOTTA }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                : <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: TERRACOTTA }}
              title="Upload photo"
            >
              {avatarUploading ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Camera className="h-3.5 w-3.5 text-white" />}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: TERRACOTTA + "18", color: TEAL }}>
                {isEmployer ? "Employer Account" : "Professional Account"}
              </span>
            </div>
            <div className="sm:w-56 shrink-0">
              <ProfileStrength pct={completeness} label={strengthLabel} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
                style={active ? { borderColor: TERRACOTTA, color: TEAL } : { borderColor: "transparent", color: "#9ca3af" }}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Security tab (outside form) ── */}
        {tab === "security" ? (
          <div className="p-6 space-y-6">

            {/* ── Email address change ── */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">Email Address</h3>
              <p className="text-xs text-gray-400 mb-1">Current: <span className="font-semibold text-gray-600">{user?.email}</span></p>
              <p className="text-xs text-gray-400 mb-5">A confirmation will be sent to your new address before the change takes effect.</p>

              {emailChangeResult ? (
                <div className="max-w-md rounded-xl border border-dashed p-4 space-y-2"
                  style={{ borderColor: TEAL + "80", backgroundColor: TEAL + "08" }}>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: TEAL }}>
                    <Mail className="h-4 w-4" /> Confirmation email sent
                  </div>
                  <p className="text-xs text-gray-500">Check your new inbox and click the link to confirm the change. It expires in 1 hour.</p>
                  {emailChangeResult.devLink && (
                    <div className="mt-2 pt-2 border-t border-dashed" style={{ borderColor: TEAL + "40" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Dev mode — email not configured</p>
                      <a href={emailChangeResult.devLink}
                        className="block text-xs font-semibold break-all underline" style={{ color: TERRACOTTA }}>
                        {emailChangeResult.devLink}
                      </a>
                    </div>
                  )}
                  <button type="button" onClick={() => setEmailChangeResult(null)}
                    className="text-xs underline mt-1" style={{ color: TEAL }}>
                    Change a different address
                  </button>
                </div>
              ) : (
                <form onSubmit={onChangeEmail} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelCls}>New Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className={inputCls + " pl-9"}
                        placeholder="new@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Current Password (to confirm)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        value={emailChangePassword}
                        onChange={(e) => setEmailChangePassword(e.target.value)}
                        className={inputCls + " pl-9"}
                        placeholder="Your current password"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={emailChanging}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: TEAL }}>
                    {emailChanging
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      : <><Mail className="h-4 w-4" /> Send Confirmation</>}
                  </button>
                </form>
              )}
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">Change Password</h3>
              <p className="text-xs text-gray-400 mb-5">Use a strong password that you don't use elsewhere.</p>
              <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
                {/* Current password */}
                <div>
                  <label className={labelCls}>Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...pwForm.register("currentPassword")}
                      type={showPw.current ? "text" : "password"}
                      className={inputCls + " pl-9 pr-10"}
                      placeholder="Your current password"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPw.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.currentPassword.message as string}</p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...pwForm.register("newPassword")}
                      type={showPw.new ? "text" : "password"}
                      className={inputCls + " pl-9 pr-10"}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPw.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.newPassword.message as string}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...pwForm.register("confirmPassword")}
                      type={showPw.confirm ? "text" : "password"}
                      className={inputCls + " pl-9 pr-10"}
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{pwForm.formState.errors.confirmPassword.message as string}</p>
                  )}
                </div>

                <button type="submit" disabled={pwSaving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: TERRACOTTA }}>
                  {pwSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><ShieldCheck className="h-4 w-4" /> Change Password</>}
                </button>
              </form>
            </div>

            <hr className="border-gray-100" />

            {/* ── Connected Accounts ── */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-0.5">Connected Accounts</h3>
              <p className="text-xs text-gray-400 mb-5">Link your Google account for one-click sign-in.</p>

              {linkedLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking connections…
                </div>
              ) : (
                <div className="max-w-md rounded-xl border border-gray-200 overflow-hidden">
                  {/* Google row */}
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 bg-white shadow-sm">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">Google</p>
                      {googleLinked ? (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: TEAL }} />
                          <span>Connected — sign in with Google is active</span>
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">Not connected</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {googleLinked ? (
                        <button
                          type="button"
                          onClick={handleGoogleDisconnect}
                          disabled={unlinking}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-50"
                        >
                          {unlinking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disconnect"}
                        </button>
                      ) : !hasGoogle ? (
                        <span className="text-xs text-gray-400 italic">Not configured</span>
                      ) : (
                        <a
                          href={`/api/auth/google/link?token=${localStorage.getItem("bridgepath_token") ?? ""}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: "#4285F4" }}
                        >
                          Connect
                        </a>
                      )}
                    </div>
                  </div>
                  {googleLinked && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                      <p className="text-[11px] text-gray-400">
                        If Google is your only sign-in method, set a password via "Change Password" before disconnecting.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-gray-100" />
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">Account</h3>
              <p className="text-xs text-gray-400 mb-3">Get help or manage your data.</p>
              <div className="flex flex-wrap gap-2">
                <a href="mailto:support@bridgepathnetwork.com"
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit as any)}>
            <div className="p-6 space-y-5">

              {/* ── TAB: Info ── */}
              {tab === "info" && (
                <>
                  {isEmployer ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Company Name" required error={form.formState.errors.companyName?.message as string}>
                          <input className={inputCls} placeholder="Acme Corp" {...form.register("companyName")} />
                        </Field>
                        <Field label="Industry">
                          <select className={inputCls} {...form.register("industry")}>
                            <option value="">Select industry…</option>
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="City / Region">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input className={inputCls + " pl-9"} placeholder="Accra" {...form.register("location")} />
                          </div>
                        </Field>
                        <Field label="Country" required error={form.formState.errors.country?.message as string}>
                          <select className={inputCls} {...form.register("country")}>
                            <option value="">Select country…</option>
                            {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Company Size">
                        <div className="flex flex-wrap gap-2">
                          {COMPANY_SIZES.map(s => {
                            const active = form.watch("companySize") === s;
                            return (
                              <button key={s} type="button"
                                onClick={() => form.setValue("companySize", active ? "" : s)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                                style={active ? { backgroundColor: INK, borderColor: INK, color: "white" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                                {s} employees
                              </button>
                            );
                          })}
                        </div>
                      </Field>
                      <Field label="Company Description" hint="Max 800 characters">
                        <textarea className={inputCls + " min-h-[130px] resize-none"}
                          placeholder="Tell candidates what makes your company a great place to work…"
                          {...form.register("bio")} />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Professional Summary" hint="Max 500 characters">
                        <textarea className={inputCls + " min-h-[110px] resize-none"}
                          placeholder="A brief summary of your career goals and strengths…"
                          {...form.register("bio")} />
                        <span className="text-xs text-gray-400 mt-1 block text-right">
                          {(form.watch("bio") || "").length}/500
                        </span>
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="City / Region">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input className={inputCls + " pl-9"} placeholder="Accra" {...form.register("location")} />
                          </div>
                        </Field>
                        <Field label="Country" required error={form.formState.errors.country?.message as string}>
                          <select className={inputCls} {...form.register("country")}>
                            <option value="">Select country…</option>
                            {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Education" hint="Degree, institution, year">
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input className={inputCls + " pl-9"}
                            placeholder="BSc Computer Science, University of Ghana, 2020"
                            {...form.register("education")} />
                        </div>
                      </Field>
                    </>
                  )}
                </>
              )}

              {/* ── TAB: Skills & CV (job seekers only) ── */}
              {tab === "skills" && !isEmployer && (
                <>
                  <Field label="Skills" hint="Press Enter or comma to add each skill">
                    <div className="flex flex-wrap gap-2 p-3 min-h-[52px] rounded-xl border border-gray-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-white">
                      {skills.map(skill => (
                        <SkillChip key={skill} label={skill} onRemove={() => setSkills(prev => prev.filter(s => s !== skill))} />
                      ))}
                      <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKey} onBlur={addSkill}
                        placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add another…"}
                        className="flex-1 min-w-[140px] outline-none text-sm bg-transparent placeholder:text-gray-400" />
                    </div>
                    {skills.length > 0 && <p className="text-xs text-gray-400 mt-1">{skills.length} skill{skills.length !== 1 ? "s" : ""} added</p>}
                  </Field>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggested skills</p>
                    <div className="flex flex-wrap gap-2">
                      {["JavaScript", "Python", "React", "SQL", "Figma", "Project Management", "Data Analysis", "Communication"]
                        .filter(s => !skills.includes(s))
                        .map(s => (
                          <button key={s} type="button" onClick={() => setSkills(prev => [...prev, s])}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-primary/50 hover:text-primary transition-colors">
                            <Plus className="h-3 w-3" />{s}
                          </button>
                        ))}
                    </div>
                  </div>

                  <Field label="Experience Summary" hint="Walk employers through your work history">
                    <textarea className={inputCls + " min-h-[160px] resize-none"}
                      placeholder={"e.g. 3 years at Tech Startup as Lead Engineer, built a platform that scaled to 50k users.\n\n2 years at Agency X as Frontend Developer, working with React and Vue."}
                      {...form.register("experience")} />
                  </Field>

                  {/* CV upload */}
                  <Field label="CV / Resume" hint="PDF or Word document, max 10 MB">
                    <div className="flex items-center gap-3">
                      {cvUrl && (
                        <a href={cvUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
                          style={{ borderColor: TEAL + "40", backgroundColor: TEAL + "08", color: TEAL }}>
                          <FileText className="h-4 w-4" />
                          {cvFileName || "View CV"}
                        </a>
                      )}
                      <button type="button" onClick={() => cvInputRef.current?.click()} disabled={cvUploading}
                        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60">
                        {cvUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> {cvUrl ? "Replace CV" : "Upload CV"}</>}
                      </button>
                      <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
                    </div>
                    {cvUrl && (
                      <p className="text-xs text-gray-400 mt-1.5">Your CV will be shared with employers when you apply for jobs.</p>
                    )}
                  </Field>
                </>
              )}

              {/* ── TAB: Links ── */}
              {tab === "links" && (
                <>
                  <div className="space-y-4">
                    {!isEmployer && (
                      <Field label="LinkedIn Profile">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0a66c2]" />
                          <input className={inputCls + " pl-9"} placeholder="https://linkedin.com/in/yourname"
                            {...form.register("linkedinUrl")} />
                        </div>
                        {form.formState.errors.linkedinUrl && (
                          <p className="text-xs text-red-500 mt-1">{form.formState.errors.linkedinUrl.message as string}</p>
                        )}
                      </Field>
                    )}
                    <Field label={isEmployer ? "Company Website" : "Portfolio / Personal Website"}>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input className={inputCls + " pl-9"} placeholder="https://"
                          {...form.register(isEmployer ? "companyWebsite" : "portfolioUrl")} />
                      </div>
                      {(form.formState.errors as any)[isEmployer ? "companyWebsite" : "portfolioUrl"]?.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {(form.formState.errors as any)[isEmployer ? "companyWebsite" : "portfolioUrl"].message}
                        </p>
                      )}
                    </Field>
                  </div>
                  <div className="mt-4 rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: TERRACOTTA + "0d" }}>
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: TEAL }}>Boost your visibility</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Profiles with LinkedIn and portfolio links get 3× more employer views on Bridgepath Africa.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Save footer ── */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {savedOk && (
                  <span className="flex items-center gap-1.5 text-primary font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                    <CheckCircle2 className="h-4 w-4" /> Saved successfully
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {tabs.map(t => t.id).indexOf(tab) < tabs.map(t => t.id).lastIndexOf(tabs.find(t => t.id !== "security")?.id ?? "info") && (
                  <button type="button"
                    onClick={() => {
                      const ids = tabs.filter(t => t.id !== "security").map(t => t.id);
                      const idx = ids.indexOf(tab as any);
                      if (idx < ids.length - 1) setTab(ids[idx + 1] as Tab);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: TERRACOTTA }}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Small helpers ── */
const inputCls = "w-full h-11 px-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/20 bg-white text-gray-900 placeholder:text-gray-400";
const labelCls = "text-sm font-semibold text-gray-700 block mb-1.5";

function Field({ label, hint, required, error, children }: {
  label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls}>
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
