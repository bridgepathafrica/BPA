import { useGetDashboardStats, useGetMyApplications } from "@workspace/api-client-react";
import { isDemoEmail, getDemoApplications } from "@/lib/demoAuth";
import { useEffect, useState } from "react";
import { useAuth, getAuthToken } from "@/lib/auth";
import { Link } from "wouter";
import {
  FileText, Send, CheckCircle2, Clock, ArrowRight, Eye, Bot,
  ShieldCheck, TrendingUp, Briefcase, Sparkles, ChevronRight,
  Search, Bell, LayoutDashboard, X, UserPlus, MessageSquare,
  Star, Quote, Bookmark, MapPin, DollarSign
} from "lucide-react";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";

const activityData = [
  { week: "Wk 1", applications: 2, views: 7 },
  { week: "Wk 2", applications: 4, views: 13 },
  { week: "Wk 3", applications: 3, views: 9 },
  { week: "Wk 4", applications: 7, views: 21 },
  { week: "Wk 5", applications: 5, views: 16 },
  { week: "Wk 6", applications: 9, views: 28 },
];

const mockApplications = [
  { id: 1, job: { title: "Software Engineer (Full Stack)", employer: { name: "Andela" } }, status: "shortlisted", viewedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, job: { title: "Backend Engineer (Python)", employer: { name: "Flutterwave" } }, status: "reviewing", viewedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 3, job: { title: "Mobile App Developer (Android)", employer: { name: "M-KOPA" } }, status: "applied", viewedAt: null, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 4, job: { title: "HR Business Partner", employer: { name: "Safaricom" } }, status: "shortlisted", viewedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 5, job: { title: "Digital Marketing Specialist", employer: { name: "Jumia" } }, status: "rejected", viewedAt: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 6, job: { title: "Sales Director – East Africa", employer: { name: "SAP Africa" } }, status: "applied", viewedAt: null, createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
];

const demoFeedback = [
  { id: 1, content: "Strong technical skills and a well-structured CV. We'd recommend gaining more experience with cloud infrastructure before reapplying for senior roles.", isAnonymous: false, employerName: "TechBridge Africa", jobTitle: "Senior Software Engineer", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, content: "Your communication and leadership examples were compelling. Consider quantifying your impact more clearly — numbers make a real difference to hiring managers.", isAnonymous: true, employerName: null, jobTitle: "Product Manager", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const recommendedJobs = [
  { title: "UX Designer", company: "Ogilvy Africa", location: "Accra, GH", salary: "$35k–55k", tag: "New" },
  { title: "Frontend Engineer", company: "Andela", location: "Remote", salary: "$60k–90k", tag: "Hot" },
  { title: "Product Manager", company: "M-KOPA", location: "Nairobi, KE", salary: "$55k–80k", tag: "" },
];

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  accepted:   { label: "Accepted",    bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  rejected:   { label: "Rejected",    bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
  shortlisted:{ label: "Shortlisted", bg: "#dbeafe", color: "#2563eb", dot: "#2563eb" },
  reviewing:  { label: "In Review",   bg: "#fef3c7", color: "#d97706", dot: "#d97706" },
  applied:    { label: "Applied",     bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  pending:    { label: "Applied",     bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  interview:  { label: "Interview",   bg: "#ede9fe", color: "#7c3aed", dot: "#7c3aed" },
  offer:      { label: "Offer",       bg: "#d1fae5", color: "#059669", dot: "#059669" },
  hired:      { label: "Hired",       bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
};

function KPICard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "15" }}>
          <div style={{ color: accent }}>{icon}</div>
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: "#1F7A78", backgroundColor: "rgba(31,122,120,0.10)" }}>
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight" style={{ color: INK }}>{value}</div>
      <div className="text-xs font-medium text-gray-800 mt-0.5">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: ["dashboardStats"], enabled: !isDemo }
  });
  const { data: apiApplications } = useGetMyApplications({
    query: { queryKey: ["myApplications"], enabled: !isDemo }
  });

  const { savedJobs, toggleSave } = useSavedJobs(!isDemo && !!user);

  const { data: realFeedback } = useQuery({
    queryKey: ["my-feedback", user?.id],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch(`/api/candidates/${user!.id}/feedback`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return [];
      return res.json() as Promise<any[]>;
    },
    enabled: !isDemo && !!user?.id,
  });

  const [demoApps, setDemoApps] = useState(() => isDemo ? getDemoApplications() : []);
  useEffect(() => {
    if (!isDemo) return;
    setDemoApps(getDemoApplications());
    const handler = () => setDemoApps(getDemoApplications());
    window.addEventListener("storage", handler);
    window.addEventListener("focus", handler);
    return () => { window.removeEventListener("storage", handler); window.removeEventListener("focus", handler); };
  }, [isDemo]);

  const applications = isDemo
    ? [...demoApps, ...mockApplications]
    : (apiApplications && apiApplications.length > 0) ? apiApplications : mockApplications;

  const feedback = isDemo ? demoFeedback : (realFeedback ?? []);

  const totalApps = isDemo ? applications.length : (statsLoading ? 15 : (stats?.totalApplications || 15));
  const shortlisted = isDemo
    ? applications.filter((a: any) => a.status === "shortlisted").length
    : (statsLoading ? 3 : (stats?.shortlistedApplications || 3));
  const pending = isDemo
    ? applications.filter((a: any) => a.status === "applied" || a.status === "reviewing" || a.status === "pending").length
    : (statsLoading ? 6 : (stats?.pendingApplications || 6));
  const viewedCount = applications.filter((a: any) => a.viewedAt).length;

  const firstName = user?.name?.split(" ")[0] || "Professional";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── DEMO BANNER ── */}
      {isDemo && !demoBannerDismissed && (
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 border gap-3" style={{ backgroundColor: INK, borderColor: INK }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA + "25" }}>
              <Sparkles className="h-4 w-4" style={{ color: TERRACOTTA }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">You're in demo mode as <span style={{ color: TERRACOTTA }}>Ama Boateng</span></p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Explore the full platform — data is not saved. Create an account to get started for real.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/auth/signup">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90" style={{ backgroundColor: TERRACOTTA }}>
                <UserPlus className="h-3.5 w-3.5" /> Create account
              </button>
            </Link>
            <button onClick={() => setDemoBannerDismissed(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── TOP: Welcome + next action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Career Command Centre</p>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>Good to see you, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's where your job search stands today.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/jobs">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: TERRACOTTA }}>
              <Search className="h-4 w-4" /> Browse Jobs
            </button>
          </Link>
          <Link href="/cv-review">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: INK }}>
              <Sparkles className="h-4 w-4" style={{ color: TERRACOTTA }} /> CV Review
            </button>
          </Link>
        </div>
      </div>

      {/* ── NOTIFICATION BANNERS ── */}
      {feedback.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 border" style={{ backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-violet-100">
              <MessageSquare className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">{feedback.length} employer{feedback.length > 1 ? "s" : ""} left you career feedback</p>
              <p className="text-xs text-violet-600">Professional growth insights to help you stand out</p>
            </div>
          </div>
          <a href="#feedback-section" className="text-xs font-semibold text-violet-600 flex items-center gap-1 hover:gap-2 transition-all">
            Read <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {shortlisted > 0 && (
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 border" style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-blue-100">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">{shortlisted} employer{shortlisted > 1 ? "s" : ""} shortlisted you</p>
              <p className="text-xs text-blue-600">Review your shortlisted applications and follow up</p>
            </div>
          </div>
          <Link href="/jobs">
            <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              View <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Applications"
          value={totalApps}
          sub="All time"
          icon={<Send className="h-4.5 w-4.5" />}
          accent={INK}
          trend="+2 this week"
        />
        <KPICard
          label="Shortlisted"
          value={shortlisted}
          sub="Employers interested"
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          accent={TERRACOTTA}
        />
        <KPICard
          label="Awaiting Response"
          value={pending}
          sub="In review pipeline"
          icon={<Clock className="h-4.5 w-4.5" />}
          accent={AMBER}
        />
        <KPICard
          label="Profile Viewed"
          value={viewedCount}
          sub="Applications viewed"
          icon={<Eye className="h-4.5 w-4.5" />}
          accent={BLUE}
          trend={viewedCount > 0 ? `${viewedCount} viewed` : undefined}
        />
      </div>

      {/* ── MAIN CONTENT: Chart + Career Tools ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Activity Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Applications sent vs. profile views — last 6 weeks</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: TERRACOTTA }} /> Applications</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: BLUE }} /> Views</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TERRACOTTA} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={TERRACOTTA} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", fontSize: 12 }} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="applications" stroke={TERRACOTTA} strokeWidth={2} fill="url(#appGrad)" name="Applications" dot={false} />
              <Area type="monotone" dataKey="views" stroke={BLUE} strokeWidth={2} fill="url(#viewGrad)" name="Profile Views" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Career tools */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Career Tools</h2>
          <div className="space-y-3">
            <Link href="/cv-review">
              <div className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-primary/50 hover:bg-orange-50/40 cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA + "15" }}>
                  <Bot className="h-4.5 w-4.5" style={{ color: TERRACOTTA }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">AI CV Review</p>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: TERRACOTTA + "20", color: TERRACOTTA }}>Free</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Instant AI analysis &amp; feedback</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/cv-review">
              <div className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">Human HR Review</p>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">$15</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Personalized expert feedback</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-400 transition-colors" />
              </div>
            </Link>

            <Link href="/profile">
              <div className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer transition-all">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-50">
                  <LayoutDashboard className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Complete Your Profile</p>
                  <p className="text-xs text-gray-500 mt-0.5">Stand out to employers</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Profile completeness */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-700">Profile strength</span>
              <span className="text-xs font-bold" style={{ color: TERRACOTTA }}>65%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full transition-all" style={{ width: "65%", backgroundColor: TERRACOTTA }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Add work experience to reach 80%</p>
          </div>
        </div>
      </div>

      {/* ── SAVED JOBS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: TERRACOTTA + "15" }}>
              <Bookmark className="h-4 w-4" style={{ color: TERRACOTTA }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Saved Jobs</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isDemo ? "Demo — sign in to save real jobs" : savedJobs.length === 0 ? "Bookmark roles you want to revisit" : `${savedJobs.length} role${savedJobs.length !== 1 ? "s" : ""} saved`}
              </p>
            </div>
          </div>
          <Link href="/saved-jobs">
            <button className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all" style={{ color: TERRACOTTA }}>
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {isDemo || savedJobs.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Bookmark className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">No saved jobs yet</p>
            <p className="text-xs text-gray-300 mt-1">Click the bookmark icon on any job listing to save it here</p>
            <Link href="/jobs">
              <button className="mt-4 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{ backgroundColor: TERRACOTTA }}>
                Explore Open Roles
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {savedJobs.slice(0, 5).map((s: any) => {
              const job = s.job;
              if (!job) return null;
              return (
                <div key={job.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: INK + "10", color: INK }}>
                      {job.employer?.name?.[0] || "C"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{job.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                        <span className="font-medium text-gray-600">{job.employer?.name}</span>
                        {job.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.location}</span>}
                        {job.salaryMin && job.salaryMax && (
                          <span className="flex items-center gap-0.5 font-semibold" style={{ color: TERRACOTTA }}>
                            <DollarSign className="h-3 w-3" />{(job.salaryMin / 1000).toFixed(0)}k–{(job.salaryMax / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSave(job.id)}
                      title="Remove from saved"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border opacity-0 group-hover:opacity-100 transition-all"
                      style={{ borderColor: "#e5e7eb", color: "#9ca3af" }}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={TERRACOTTA} style={{ color: TERRACOTTA }} />
                    </button>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="px-3 py-1.5 text-xs font-bold rounded-lg transition-opacity hover:opacity-90 text-white" style={{ backgroundColor: TERRACOTTA }}>
                        Apply
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── APPLICATIONS + RECOMMENDED JOBS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Applications list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Recent Applications</h2>
              <p className="text-xs text-gray-400 mt-0.5">{applications.length} applications total · {viewedCount} viewed by employers</p>
            </div>
            <Link href="/applications">
              <button className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all" style={{ color: TERRACOTTA }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {applications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Send className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-400">No applications yet</p>
                <p className="text-xs text-gray-300 mt-1">Browse open roles and start applying</p>
                <Link href="/jobs">
                  <button className="mt-4 px-4 py-2 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: TERRACOTTA }}>Browse Jobs</button>
                </Link>
              </div>
            ) : applications.slice(0, 6).map((app: any) => {
              const s = statusConfig[app.status] || statusConfig.applied;
              return (
                <Link key={app.id} href={app.job?.id ? `/jobs/${app.job.id}` : "/applications"}>
                  <div className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: INK + "10", color: INK }}>
                        {(app.job?.title || "J")[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate group-hover:text-orange-700 transition-colors">{app.job?.title || "Position"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">{app.job?.employer?.name || "Company"} · {format(new Date(app.createdAt), "MMM d")}</p>
                          {app.viewedAt && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: BLUE + "15", color: BLUE }}>
                              <Eye className="h-2.5 w-2.5" /> Viewed {formatDistanceToNow(new Date(app.viewedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/applications">
              <button className="w-full py-2 text-xs font-semibold rounded-xl border-2 transition-all hover:text-white hover:shadow-sm"
                style={{ borderColor: TERRACOTTA, color: TERRACOTTA }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = TERRACOTTA; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = TERRACOTTA; }}>
                View All Applications →
              </button>
            </Link>
          </div>
        </div>

        {/* Recommended jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Recommended for You</h2>
            <p className="text-xs text-gray-400 mt-0.5">Based on your profile</p>
          </div>
          <div className="divide-y divide-gray-50">
            {recommendedJobs.map((job, i) => (
              <Link key={i} href="/jobs">
                <div className="px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors leading-snug">{job.title}</p>
                    {job.tag && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: job.tag === "Hot" ? "#fee2e2" : TERRACOTTA + "20", color: job.tag === "Hot" ? "#dc2626" : TERRACOTTA }}>
                        {job.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: TERRACOTTA }}>{job.salary}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gray-50">
            <Link href="/jobs">
              <button
                className="w-full py-2.5 text-xs font-semibold rounded-xl border-2 transition-all hover:text-white hover:shadow-sm"
                style={{ borderColor: TERRACOTTA, color: TERRACOTTA }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = TERRACOTTA; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = TERRACOTTA; }}
              >
                View All Open Roles →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── GROWTH FEEDBACK FROM EMPLOYERS ── */}
      {feedback.length > 0 && (
        <div id="feedback-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: PURPLE + "15" }}>
              <Star className="h-4 w-4" style={{ color: PURPLE }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Employer Growth Feedback</h2>
              <p className="text-xs text-gray-400 mt-0.5">Professional insights to help you grow — shared directly from employers</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {feedback.map((item: any) => (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5" style={{ backgroundColor: item.isAnonymous ? "#94a3b8" : PURPLE }}>
                    {item.isAnonymous ? "?" : (item.employerName?.[0] ?? "E")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {item.isAnonymous ? "Anonymous Employer" : (item.employerName ?? "Employer")}
                      </span>
                      {item.isAnonymous && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Anonymous</span>
                      )}
                      {item.jobTitle && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: PURPLE + "15", color: PURPLE }}>
                          {item.jobTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 p-3.5 rounded-xl" style={{ backgroundColor: "#f8f5ff" }}>
                      <Quote className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: PURPLE }} />
                      <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
