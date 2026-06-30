import { Link } from "wouter";
import { useGetDashboardStats, useListJobs } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { isDemoEmail } from "@/lib/demoAuth";
import { useState } from "react";
import { format } from "date-fns";
import {
  PlusCircle, Briefcase, Users, CheckCircle2, TrendingUp,
  BarChart3, Search, MessageSquare, ChevronRight, Bell,
  ArrowUpRight, Clock, Zap, Sparkles, X, UserPlus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const AMBER = "#f59e0b";
const PURPLE = "#8b5cf6";

const hiringFunnel = [
  { stage: "Applied", count: 47 },
  { stage: "Reviewed", count: 28 },
  { stage: "Shortlisted", count: 12 },
  { stage: "Interviewed", count: 6 },
  { stage: "Hired", count: 2 },
];

const trendData = [
  { month: "Nov", applications: 8 },
  { month: "Dec", applications: 14 },
  { month: "Jan", applications: 22 },
  { month: "Feb", applications: 18 },
  { month: "Mar", applications: 31 },
  { month: "Apr", applications: 47 },
];

const mockJobs = [
  { id: 201, title: "Senior Software Engineer", location: "Remote", applicantCount: 18, isActive: true, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 202, title: "Product Manager", location: "Nairobi, KE", applicantCount: 12, isActive: true, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 203, title: "HR Business Partner", location: "Lagos, NG", applicantCount: 9, isActive: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 204, title: "Data Analyst", location: "Accra, GH", applicantCount: 8, isActive: false, createdAt: new Date(Date.now() - 21 * 86400000).toISOString() },
];

const candidateProfiles = [
  { id: 1, initials: "AM", name: "Amina Mensah", title: "Senior Software Engineer", location: "Nairobi, KE", exp: "6 yrs", skills: ["React", "Node.js", "AWS"], score: 92 },
  { id: 2, initials: "PR", name: "Peter Rono", title: "Product Manager", location: "Accra, GH", exp: "4 yrs", skills: ["Agile", "Roadmapping", "Analytics"], score: 88 },
  { id: 3, initials: "LO", name: "Lydia Osei", title: "HR Operations Lead", location: "Remote", exp: "5 yrs", skills: ["HRIS", "People Ops", "Compliance"], score: 85 },
  { id: 4, initials: "SN", name: "Samuel Njoroge", title: "Data Analyst", location: "Nairobi, KE", exp: "3 yrs", skills: ["SQL", "Python", "Tableau"], score: 81 },
];

const recentActivity = [
  { text: "Amina M. applied for Senior Software Engineer", time: "2h ago", dot: TERRACOTTA, href: "/dashboard/pipeline" },
  { text: "Kwame O. shortlisted for Product Manager", time: "5h ago", dot: AMBER, href: "/dashboard/pipeline" },
  { text: "Rosa L. accepted interview for HR Business Partner", time: "1d ago", dot: PURPLE, href: "/dashboard/pipeline" },
  { text: "New application received for Data Analyst", time: "2d ago", dot: INK, href: "/dashboard/pipeline" },
];

function KPICard({ label, value, sub, icon, accent, trend, href }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accent: string; trend?: string; href?: string;
}) {
  const card = (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-shadow ${href ? "hover:shadow-md cursor-pointer" : ""}`}>
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
  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: ["dashboardStats"], enabled: !isDemo } });
  const { data: jobsResponse, isLoading: jobsLoading } = useListJobs({ limit: 5 }, { query: { queryKey: ["dashboardJobs"] } });

  const jobs = (!jobsLoading && jobsResponse?.jobs && jobsResponse.jobs.length > 0) ? jobsResponse.jobs : mockJobs;
  const activeJobCount = statsLoading ? 4 : (stats?.activeJobs || 4);
  const totalApplicants = statsLoading ? 47 : (stats?.totalApplicants || 47);
  const firstName = user?.name?.split(" ")[0] || "there";

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
              <p className="text-sm font-semibold text-white">You're in demo mode as <span style={{ color: TERRACOTTA }}>Kofi Mensah</span> · TechBridge Africa</p>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Explore the full platform — data is not saved. Create an account to start hiring for real.</p>
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

      {/* ── TOP: Welcome + primary action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Employer Dashboard</p>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">You have {activeJobCount} active listings and {totalApplicants} total applicants.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/jobs/new">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: TERRACOTTA }}>
              <PlusCircle className="h-4 w-4" /> Post a Job
            </button>
          </Link>
          <Link href="/candidates">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: INK }}>
              <Search className="h-4 w-4" /> Find Talent
            </button>
          </Link>
        </div>
      </div>

      {/* ── URGENT ACTIONS BANNER ── */}
      <div className="flex items-center justify-between rounded-2xl px-5 py-4 border" style={{ backgroundColor: "#fefce8", borderColor: "#fde68a" }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-amber-100">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">12 candidates are awaiting review</p>
            <p className="text-xs text-amber-600">Shortlist the best fits before they accept other offers</p>
          </div>
        </div>
        <Link href="/dashboard/pipeline">
          <button className="text-xs font-semibold text-amber-600 flex items-center gap-1 hover:gap-1.5 transition-all">
            Review now <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Job Listings"
          value={activeJobCount}
          sub="Currently live"
          icon={<Briefcase className="h-4.5 w-4.5" />}
          accent={TERRACOTTA}
          href="/dashboard/jobs"
        />
        <KPICard
          label="Total Applications"
          value={totalApplicants}
          sub="Across all listings"
          icon={<Users className="h-4.5 w-4.5" />}
          accent={INK}
          trend="+8 this week"
          href="/dashboard/pipeline"
        />
        <KPICard
          label="Shortlisted"
          value="12"
          sub="Ready to interview"
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          accent={PURPLE}
          href="/dashboard/pipeline"
        />
        <KPICard
          label="Open Conversations"
          value="3"
          sub="Pending your reply"
          icon={<MessageSquare className="h-4.5 w-4.5" />}
          accent={AMBER}
          href="/messages"
        />
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            href: "/jobs/new",
            icon: <Zap className="h-5 w-5" />,
            title: "Post a New Role",
            desc: "Go live in Ghana or remote hiring across Africa",
            accent: TERRACOTTA,
          },
          {
            href: "/candidates",
            icon: <Search className="h-5 w-5" />,
            title: "Browse Candidates",
            desc: "Filter by role, location, skills, experience",
            accent: INK,
          },
          {
            href: "/messages",
            icon: <MessageSquare className="h-5 w-5" />,
            title: "View Messages",
            desc: "3 conversations awaiting your reply",
            accent: PURPLE,
          },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <div className="group flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: a.accent + "15", color: a.accent }}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{a.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Application Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly applications received across all roles</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: TERRACOTTA + "15", color: TERRACOTTA }}>Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", fontSize: 12 }}
                cursor={{ stroke: "#f3f4f6", strokeWidth: 2 }}
              />
              <Line type="monotone" dataKey="applications" stroke={TERRACOTTA} strokeWidth={2.5} dot={{ fill: TERRACOTTA, r: 3, strokeWidth: 0 }} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">Hiring Funnel</h2>
          <p className="text-xs text-gray-400 mb-4">Across all open positions</p>
          <div className="space-y-3">
            {hiringFunnel.map((f) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{f.stage}</span>
                  <span className="text-xs font-bold" style={{ color: INK }}>{f.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 rounded-full" style={{ width: `${(f.count / 47) * 100}%`, backgroundColor: f.stage === "Hired" ? TERRACOTTA : f.stage === "Shortlisted" ? PURPLE : INK + "50" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Conversion to hire</span>
            <span className="text-xs font-bold text-primary">4.3%</span>
          </div>
        </div>
      </div>

      {/* ── JOBS TABLE + CANDIDATES + ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Active Job Listings</h2>
              <p className="text-xs text-gray-400 mt-0.5">{jobs.filter((j: any) => j.isActive).length} live · {jobs.filter((j: any) => !j.isActive).length} closed</p>
            </div>
            <Link href="/jobs/new">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90" style={{ backgroundColor: TERRACOTTA }}>
                <PlusCircle className="h-3.5 w-3.5" /> Post Job
              </button>
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Briefcase className="h-8 w-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">No jobs posted yet</p>
              <p className="text-xs text-gray-300 mt-1">Post your first role to start finding talent</p>
              <Link href="/jobs/new">
                <button className="mt-4 px-4 py-2 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: TERRACOTTA }}>Post a Job</button>
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {jobs.map((job: any) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/70 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: TERRACOTTA + "15", color: TERRACOTTA }}>
                          {job.title[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm group-hover:text-primary transition-colors truncate">{job.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            {job.location}
                            <span className="text-gray-300">·</span>
                            <Clock className="h-3 w-3" />
                            {format(new Date(job.createdAt), "MMM d")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-bold" style={{ color: INK }}>{job.applicantCount}</div>
                          <div className="text-[10px] text-gray-400">applicants</div>
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={job.isActive
                            ? { backgroundColor: TERRACOTTA + "20", color: TERRACOTTA }
                            : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                          {job.isActive ? "Active" : "Closed"}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30">
                <Link href="/dashboard/jobs">
                  <button className="w-full text-xs font-semibold text-center py-1.5 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-1" style={{ color: TERRACOTTA }}>
                    View all open roles <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Candidates preview + Activity */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Top Candidates</h2>
              <Link href="/candidates" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: TERRACOTTA }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {candidateProfiles.slice(0, 3).map((c) => (
                <Link key={c.id} href="/candidates">
                  <div className="px-4 py-3 hover:bg-gray-50/70 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ backgroundColor: INK }}>
                        {c.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.title} · {c.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold" style={{ color: TERRACOTTA }}>{c.score}</div>
                        <div className="text-[10px] text-gray-400">match</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-50">
              <Link href="/candidates">
                <button className="w-full text-sm font-semibold py-2.5 rounded-xl text-white transition-opacity hover:opacity-90" style={{ backgroundColor: INK }}>
                  Browse All Candidates
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: TERRACOTTA }} /> Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-start gap-3 group cursor-pointer">
                    <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">{item.text}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
