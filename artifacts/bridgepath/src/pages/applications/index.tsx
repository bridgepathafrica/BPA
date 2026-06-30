import { useState } from "react";
import { Link } from "wouter";
import { useAuth, buildAuthHeaders } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { isDemoEmail, getDemoApplications } from "@/lib/demoAuth";
import {
  Send, ArrowLeft, Search, Eye, ChevronRight, Briefcase,
  Clock, CheckCircle2, XCircle, Filter, ExternalLink
} from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

const CORAL = "#C04020";
const INK = "#1E1511";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";
const GREEN = "#22c55e";
const PURPLE = "#8b5cf6";

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string; icon: React.ElementType }> = {
  accepted:    { label: "Accepted",     bg: "#dcfce7", color: "#16a34a", dot: "#16a34a", icon: CheckCircle2 },
  rejected:    { label: "Rejected",     bg: "#fee2e2", color: "#dc2626", dot: "#dc2626", icon: XCircle },
  shortlisted: { label: "Shortlisted",  bg: "#dbeafe", color: "#2563eb", dot: "#2563eb", icon: CheckCircle2 },
  reviewing:   { label: "In Review",    bg: "#fef3c7", color: "#d97706", dot: "#d97706", icon: Clock },
  applied:     { label: "Applied",      bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", icon: Send },
  pending:     { label: "Applied",      bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", icon: Send },
  interview:   { label: "Interview",    bg: "#ede9fe", color: "#7c3aed", dot: "#7c3aed", icon: CheckCircle2 },
  offer:       { label: "Offer",        bg: "#d1fae5", color: "#059669", dot: "#059669", icon: CheckCircle2 },
  hired:       { label: "Hired",        bg: "#dcfce7", color: "#16a34a", dot: "#16a34a", icon: CheckCircle2 },
};

const mockApps = [
  { id: 1, job: { id: 101, title: "Software Engineer (Full Stack)", employer: { name: "Andela" } }, status: "shortlisted", viewedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, job: { id: 102, title: "Backend Engineer (Python)", employer: { name: "Flutterwave" } }, status: "reviewing", viewedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 3, job: { id: 103, title: "Mobile App Developer", employer: { name: "M-KOPA" } }, status: "applied", viewedAt: null, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 4, job: { id: 104, title: "HR Business Partner", employer: { name: "Safaricom" } }, status: "shortlisted", viewedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 5, job: { id: 105, title: "Digital Marketing Specialist", employer: { name: "Jumia" } }, status: "rejected", viewedAt: new Date(Date.now() - 2 * 86400000).toISOString(), createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 6, job: { id: 106, title: "Sales Director", employer: { name: "SAP Africa" } }, status: "applied", viewedAt: null, createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
];

const ALL_STATUSES = ["all", "applied", "reviewing", "shortlisted", "interview", "offer", "rejected"];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: apiApplications, isLoading } = useQuery<any[]>({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const res = await fetch("/api/applications/mine", { headers: buildAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !isDemo && !!user,
  });

  const demoApps = isDemo ? [...getDemoApplications(), ...mockApps] : [];
  const applications: any[] = isDemo
    ? demoApps
    : (apiApplications && apiApplications.length > 0 ? apiApplications : mockApps);

  const filtered = applications.filter((app) => {
    const matchStatus = statusFilter === "all" || app.status === statusFilter || (statusFilter === "applied" && app.status === "pending");
    const matchSearch = !search.trim() || app.job?.title?.toLowerCase().includes(search.toLowerCase()) || app.job?.employer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { all: applications.length };
  applications.forEach((a) => {
    const key = a.status === "pending" ? "applied" : a.status;
    counts[key] = (counts[key] || 0) + 1;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <PageSEO title="My Applications | Bridgepath Africa" description="Track all your job applications, statuses, and employer feedback in one place." path="/applications" />

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard/jobseeker">
                <button className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                  <ArrowLeft className="h-4 w-4 text-gray-500" />
                </button>
              </Link>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: CORAL }}>Job Applications</p>
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: INK }}>My Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "Loading..." : `${applications.length} application${applications.length !== 1 ? "s" : ""} · ${applications.filter(a => a.viewedAt).length} viewed by employers`}
            </p>
          </div>
          <Link href="/jobs">
            <button className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition shadow-sm" style={{ backgroundColor: CORAL }}>
              <Briefcase className="h-4 w-4" /> Find Jobs
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition"
            style={{ "--tw-ring-color": `${CORAL}40` } as any}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => {
            const cfg = statusConfig[s];
            const active = statusFilter === s;
            const count = counts[s] || 0;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={active
                  ? { backgroundColor: s === "all" ? INK : cfg?.bg, color: s === "all" ? "white" : cfg?.color, borderColor: "transparent" }
                  : { backgroundColor: "transparent", color: "#6b7280", borderColor: "#e5e7eb" }
                }
              >
                {s === "all" ? "All" : cfg?.label ?? s}
                {count > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: active ? "rgba(255,255,255,0.25)" : "#f3f4f6", color: active ? "inherit" : "#9ca3af" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <Send className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">
            {search || statusFilter !== "all" ? "No applications match your filters" : "No applications yet"}
          </p>
          <p className="text-xs text-gray-300 mt-1 mb-4">
            {search || statusFilter !== "all" ? "Try adjusting your search or status filter" : "Browse open roles and start applying"}
          </p>
          {statusFilter !== "all" || search ? (
            <button onClick={() => { setStatusFilter("all"); setSearch(""); }} className="text-xs font-semibold hover:underline" style={{ color: CORAL }}>
              Clear filters
            </button>
          ) : (
            <Link href="/jobs">
              <button className="px-4 py-2 text-xs font-bold text-white rounded-lg hover:opacity-90" style={{ backgroundColor: CORAL }}>Browse Jobs</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((app: any, i: number) => {
              const s = statusConfig[app.status] || statusConfig.applied;
              const StatusIcon = s.icon;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-5 py-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: INK + "10", color: INK }}>
                      {(app.job?.title || "J")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/jobs/${app.job?.id}`}>
                            <p className="font-semibold text-gray-900 text-sm truncate hover:underline cursor-pointer group-hover:text-orange-700 transition-colors">
                              {app.job?.title || "Position"}
                            </p>
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="text-xs font-medium text-gray-500">{app.job?.employer?.name || "Company"}</span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Applied {format(new Date(app.createdAt), "MMM d, yyyy")}
                            </span>
                            {app.viewedAt && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: BLUE + "15", color: BLUE }}>
                                <Eye className="h-2.5 w-2.5" /> Viewed {formatDistanceToNow(new Date(app.viewedAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                            {s.label}
                          </span>
                          <Link href={`/jobs/${app.job?.id}`}>
                            <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition opacity-0 group-hover:opacity-100">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <Link href="/dashboard/jobseeker">
          <button className="flex items-center gap-1.5 font-semibold hover:text-gray-600 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </Link>
        <Link href="/jobs">
          <button className="flex items-center gap-1.5 font-semibold hover:text-gray-600 transition">
            Find more jobs <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
