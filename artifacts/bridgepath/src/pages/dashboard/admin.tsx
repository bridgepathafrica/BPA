import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth, getAuthToken } from "@/lib/auth";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LayoutDashboard, Users, Briefcase, FileText, Mail, Star,
  LogOut, Trash2, ToggleLeft, ToggleRight, RefreshCw, Shield,
  CheckCircle, Clock, ChevronDown, TrendingUp, TrendingDown,
  DollarSign, Activity, Send, Bell, ChevronRight, Menu,
  Eye, UserCheck, UserX, AlertTriangle, Zap, BarChart2, X,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const NAVY    = "#0A1628";
const SIDEBAR = "#060D18";
const CORAL   = "#C04020";
const MARIGOLD= "#F0A010";
const TEAL    = "#1F7A78";
const CREAM   = "#FEF9F4";
const CARD    = "rgba(255,255,255,0.045)";
const BORDER  = "rgba(255,255,255,0.08)";

type Section = "overview" | "revenue" | "users" | "jobs" | "applications" | "contacts" | "cvreviews" | "notifications";

// ── API helper ────────────────────────────────────────────────────────────────
async function api(path: string, opts?: RequestInit) {
  const token = getAuthToken();
  const r = await fetch(`/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Spin() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-7 w-7 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
    </div>
  );
}

function Badge({ v }: { v: string }) {
  const map: Record<string, [string, string]> = {
    pending:      ["#F0A01018", "#F0A010"],
    shortlisted:  ["#1F7A7818", "#1F7A78"],
    accepted:     ["#16a34a18", "#16a34a"],
    rejected:     ["#dc262618", "#dc2626"],
    withdrawn:    ["#71717118", "#717171"],
    active:       ["#16a34a18", "#16a34a"],
    inactive:     ["#71717118", "#717171"],
    admin:        [`${CORAL}22`, CORAL],
    employer:     ["#1F7A7820", TEAL],
    job_seeker:   ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.5)"],
    sent:         ["#16a34a18", "#16a34a"],
    failed:       ["#dc262618", "#dc2626"],
    paid:         ["#16a34a18", "#16a34a"],
    none:         ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.3)"],
    pending_payment: ["#F0A01018", "#F0A010"],
    in_review:    ["#3b82f618", "#3b82f6"],
    reviewed:     ["#16a34a18", "#16a34a"],
  };
  const [bg, fg] = map[v] ?? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.4)"];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      style={{ background: bg, color: fg }}>
      {v.replace(/_/g, " ")}
    </span>
  );
}

function KpiCard({ label, value, sub, icon: Icon, trend, trendLabel, accent = CORAL }:
  { label: string; value: string | number; sub?: string; icon?: any; trend?: number | null; trendLabel?: string; accent?: string }) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group transition-all hover:scale-[1.01]"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, ${accent}08, transparent 60%)` }} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
          <div className="text-3xl font-black text-white leading-none">{value}</div>
          {sub && <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</div>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ml-3"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </div>
        )}
      </div>
      {trend !== undefined && trend !== null && (
        <div className="flex items-center gap-1.5">
          {trendUp
            ? <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          <span className="text-xs font-semibold" style={{ color: trendUp ? "#4ade80" : "#f87171" }}>
            {trendUp ? "+" : ""}{trend}%
          </span>
          {trendLabel && <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, onRefresh }: { title: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {onRefresh && (
        <button onClick={onRefresh} className="p-2 rounded-xl hover:bg-white/08 transition-colors">
          <RefreshCw className="h-4 w-4" style={{ color: "rgba(255,255,255,0.4)" }} />
        </button>
      )}
    </div>
  );
}

function Table({ cols, rows, empty = "No data." }: { cols: string[]; rows: React.ReactNode[][]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${BORDER}` }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.025)", borderBottom: `1px solid ${BORDER}` }}>
            {cols.map(c => (
              <th key={c} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.3)" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} className="px-4 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>{empty}</td></tr>
            : rows.map((cells, i) => (
                <tr key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)" }}>
                  {cells.map((cell, j) => <td key={j} className="px-4 py-3 text-white/80">{cell}</td>)}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

function Confirm({ label, onClick, className = "" }: { label: string; onClick: () => void; className?: string }) {
  const [on, setOn] = useState(false);
  if (!on) return <button onClick={() => setOn(true)} className={`text-xs px-2 py-1 rounded font-medium text-red-400/70 hover:text-red-400 transition-colors ${className}`}>{label}</button>;
  return (
    <span className="flex items-center gap-1">
      <button onClick={() => { onClick(); setOn(false); }} className="text-xs px-2 py-1 rounded font-bold text-white bg-red-600">Sure?</button>
      <button onClick={() => setOn(false)} className="text-xs px-1 py-1 text-white/30 hover:text-white">✕</button>
    </span>
  );
}

function RoleSelect({ val, onChange }: { val: string; onChange: (v: string) => void }) {
  return (
    <select value={val} onChange={e => onChange(e.target.value)}
      className="text-[10px] font-bold uppercase rounded px-2 py-1 cursor-pointer outline-none"
      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", border: `1px solid ${BORDER}` }}>
      <option value="job_seeker">Job Seeker</option>
      <option value="employer">Employer</option>
      <option value="admin">Admin</option>
    </select>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? "Search…"}
      className="px-3.5 py-2 rounded-xl text-sm text-white outline-none placeholder:text-white/25 flex-1 max-w-xs"
      style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}` }} />
  );
}

// ── Custom Recharts tooltip ───────────────────────────────────────────────────
function ChartTip({ active, payload, label, prefix = "", suffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs space-y-1" style={{ background: "#0A1628", border: `1px solid ${BORDER}`, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div className="font-bold text-white/60 mb-2">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{p.name}:</span>
          <span className="font-bold text-white">{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, r] = await Promise.all([api("/admin/stats"), api("/admin/activity"), api("/admin/revenue")]);
      setStats(s); setActivity(a); setChart(r.chart ?? []);
    } catch { /* show stale */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const actIcon: Record<string, any> = { signup: UserCheck, application: FileText, contact: Mail, cvreview: Star };
  const actColor: Record<string, string> = { signup: TEAL, application: MARIGOLD, contact: "#a855f7", cvreview: CORAL };

  if (loading) return <Spin />;
  if (!stats) return <p className="text-white/30 text-sm text-center py-16">Could not load dashboard.</p>;

  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Revenue" value={`$${(stats.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign}
          trend={stats.revenueGrowth} trendLabel="vs last mo" accent={CORAL} />
        <KpiCard label="MRR" value={`$${(stats.mrr ?? 0).toLocaleString()}`}
          sub="This month" icon={TrendingUp} accent={MARIGOLD} />
        <KpiCard label="Total Users" value={stats.totalUsers ?? 0}
          trend={stats.userGrowth} trendLabel="7d trend" icon={Users} accent={TEAL} />
        <KpiCard label="New (7 days)" value={stats.recentSignups ?? 0}
          icon={Zap} accent="#a855f7" />
        <KpiCard label="Active Jobs" value={stats.activeJobs ?? 0}
          sub={`${stats.totalJobs} total`} icon={Briefcase} accent={TEAL} />
        <KpiCard label="Applications" value={stats.totalApplications ?? 0}
          sub={`+${stats.recentApplications} this week`} icon={FileText} accent={MARIGOLD} />
      </div>

      {/* Revenue + Growth chart */}
      <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Platform Trends</div>
            <div className="text-base font-bold text-white">Revenue · Signups · Applications</div>
          </div>
          <div className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: `${CORAL}18`, color: CORAL }}>Last 12 months</div>
        </div>
        {chart.length === 0
          ? <div className="flex items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.2)" }}>
              <BarChart2 className="h-10 w-10 mr-3" /> No chart data yet — activity will appear here
            </div>
          : <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CORAL} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CORAL} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={MARIGOLD} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={MARIGOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} formatter={(v) => <span style={{ color: "rgba(255,255,255,0.5)" }}>{v}</span>} />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke={CORAL} fill="url(#gRev)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="signups" name="Signups" stroke={TEAL} fill="url(#gSig)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke={MARIGOLD} fill="url(#gApp)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
        }
      </div>

      {/* Lower row: User breakdown + Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User breakdown */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Users by Role</div>
          <div className="space-y-4">
            {Object.entries((stats.usersByRole ?? {}) as Record<string, number>).map(([role, cnt]) => {
              const pct = stats.totalUsers > 0 ? Math.round((cnt / stats.totalUsers) * 100) : 0;
              const col = role === "admin" ? CORAL : role === "employer" ? TEAL : "rgba(255,255,255,0.3)";
              return (
                <div key={role}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-white/70 capitalize">{role.replace("_", " ")}</span>
                    <span className="font-bold text-white">{cnt} <span className="text-white/30">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: col }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Applications by Status</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries((stats.appsByStatus ?? {}) as Record<string, number>).map(([s, n]) => (
                <div key={s} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Badge v={s} />
                  <span className="text-sm font-bold text-white ml-2">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Live Activity</div>
            <button onClick={load} className="p-1 rounded hover:bg-white/08 transition-colors">
              <RefreshCw className="h-3.5 w-3.5 text-white/30" />
            </button>
          </div>
          <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
            {activity.length === 0 && <p className="text-white/25 text-sm text-center py-8">No recent activity.</p>}
            {activity.map((ev, i) => {
              const Icon = actIcon[ev.type] ?? Activity;
              const color = actColor[ev.type] ?? CORAL;
              return (
                <div key={i} className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-white/05 transition-colors">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/80 leading-snug truncate">{ev.label}</div>
                    <div className="text-[10px] text-white/35 mt-0.5 truncate">{ev.sub} · {new Date(ev.time).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REVENUE ───────────────────────────────────────────────────────────────────
function RevenueSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); api("/admin/revenue").then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Spin />;
  if (!data) return <p className="text-white/30 text-sm text-center py-16">Could not load revenue data.</p>;

  const chartData = (data.chart ?? []).slice().reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Revenue (All Time)" value={`$${(data.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} accent={CORAL} />
        <KpiCard label="Revenue per Review" value={`$${data.pricePerReview ?? 15}`} sub="Human CV review" icon={Star} accent={MARIGOLD} />
        <KpiCard label="Paid Reviews" value={data.recentPaid?.length ?? 0} sub="Shown in table" icon={CheckCircle} accent={TEAL} />
      </div>

      <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Monthly Revenue</div>
        {chartData.length === 0
          ? <div className="flex items-center justify-center h-40" style={{ color: "rgba(255,255,255,0.2)" }}><DollarSign className="h-8 w-8 mr-2" /> No paid reviews yet</div>
          : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip prefix="$" />} />
                <Bar dataKey="revenue" name="Revenue ($)" fill={CORAL} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        }
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Recent Paid Reviews</div>
        <Table
          cols={["User", "Email", "Amount", "Date"]}
          empty="No paid reviews yet."
          rows={(data.recentPaid ?? []).map((r: any) => [
            <span className="font-medium text-white">{r.userName}</span>,
            <span className="text-white/50 text-xs">{r.userEmail}</span>,
            <span className="font-bold" style={{ color: "#4ade80" }}>${r.amount}</span>,
            <span className="text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>,
          ])}
        />
      </div>
    </div>
  );
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const load = useCallback(() => { setLoading(true); api("/admin/users").then(r => setUsers(Array.isArray(r) ? r : (r.users ?? []))).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);

  const changeRole = async (id: number, role: string) => {
    try { await api(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }); setUsers(u => u.map(x => x.id === id ? { ...x, role } : x)); }
    catch { alert("Failed to update role."); }
  };
  const del = async (id: number) => {
    try { await api(`/admin/users/${id}`, { method: "DELETE" }); setUsers(u => u.filter(x => x.id !== id)); }
    catch { alert("Failed to delete."); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <SectionHeader title="All Users" onRefresh={load} />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name or email…" />
        <div className="flex gap-1 rounded-xl p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}` }}>
          {["all", "job_seeker", "employer", "admin"].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
              style={{ background: filterRole === r ? CORAL : "transparent", color: filterRole === r ? "white" : "rgba(255,255,255,0.35)" }}>
              {r === "all" ? "All" : r.replace("_", " ")}
            </button>
          ))}
        </div>
        <span className="text-white/30 text-xs ml-auto">{filtered.length} users</span>
      </div>
      {loading ? <Spin /> : (
        <Table
          cols={["ID", "Name", "Email", "Role", "Verified", "Joined", "Actions"]}
          empty="No users found."
          rows={filtered.map(u => [
            <span className="text-white/25 text-xs">#{u.id}</span>,
            <span className="font-semibold text-white">{u.name}</span>,
            <span className="text-white/50 text-xs">{u.email}</span>,
            <RoleSelect val={u.role} onChange={r => changeRole(u.id, r)} />,
            u.emailVerified ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-yellow-500" />,
            <span className="text-white/35 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>,
            <Confirm label="Delete" onClick={() => del(u.id)} />,
          ])}
        />
      )}
    </div>
  );
}

// ── JOBS ──────────────────────────────────────────────────────────────────────
function JobsSection() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => { setLoading(true); api("/admin/jobs").then(setJobs).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id: number) => {
    try { const r = await api(`/admin/jobs/${id}/toggle`, { method: "PUT" }); setJobs(j => j.map(x => x.id === id ? { ...x, isActive: r.isActive } : x)); }
    catch { alert("Failed."); }
  };
  const del = async (id: number) => {
    try { await api(`/admin/jobs/${id}`, { method: "DELETE" }); setJobs(j => j.filter(x => x.id !== id)); }
    catch { alert("Failed."); }
  };

  const filtered = jobs.filter(j => {
    const ms = !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.employerName?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || (filter === "active" && j.isActive) || (filter === "inactive" && !j.isActive);
    return ms && mf;
  });

  return (
    <div>
      <SectionHeader title="All Jobs" onRefresh={load} />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search jobs or employer…" />
        <div className="flex gap-1 rounded-xl p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}` }}>
          {["all", "active", "inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
              style={{ background: filter === f ? TEAL : "transparent", color: filter === f ? "white" : "rgba(255,255,255,0.35)" }}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-white/30 text-xs ml-auto">{filtered.length} jobs</span>
      </div>
      {loading ? <Spin /> : (
        <Table
          cols={["Title", "Employer", "Location", "Type", "Status", "Apps", "Posted", ""]}
          empty="No jobs found."
          rows={filtered.map(j => [
            <span className="font-semibold text-white max-w-[180px] truncate block">{j.title}</span>,
            <span className="text-white/55 text-xs">{j.employerName}</span>,
            <span className="text-white/40 text-xs">{j.country}</span>,
            <span className="text-white/40 text-xs capitalize">{j.type?.replace("_", " ")}</span>,
            <Badge v={j.isActive ? "active" : "inactive"} />,
            <span className="font-bold text-white/70">{j.applicationCount}</span>,
            <span className="text-white/35 text-xs">{new Date(j.createdAt).toLocaleDateString()}</span>,
            <div className="flex items-center gap-1">
              <button onClick={() => toggle(j.id)} title={j.isActive ? "Deactivate" : "Activate"} className="p-1.5 rounded-lg hover:bg-white/08 transition-colors">
                {j.isActive ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-white/25" />}
              </button>
              <Confirm label="Del" onClick={() => del(j.id)} />
            </div>,
          ])}
        />
      )}
    </div>
  );
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
function ApplicationsSection() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => { setLoading(true); api("/admin/applications").then(setApps).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: string) => {
    try { await api(`/admin/applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }); setApps(a => a.map(x => x.id === id ? { ...x, status } : x)); }
    catch { alert("Failed."); }
  };

  const statuses = ["all", "pending", "shortlisted", "accepted", "rejected"];
  const filtered = apps.filter(a => {
    const ms = !search || a.applicantName?.toLowerCase().includes(search.toLowerCase()) || a.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || a.status === filter;
    return ms && mf;
  });

  return (
    <div>
      <SectionHeader title="All Applications" onRefresh={load} />
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search candidate or job…" />
        <div className="flex flex-wrap gap-1 rounded-xl p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}` }}>
          {statuses.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
              style={{ background: filter === f ? MARIGOLD : "transparent", color: filter === f ? "#000" : "rgba(255,255,255,0.35)" }}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-white/30 text-xs ml-auto">{filtered.length}</span>
      </div>
      {loading ? <Spin /> : (
        <Table
          cols={["Candidate", "Job", "Employer", "Status", "Applied", "Change Status"]}
          empty="No applications."
          rows={filtered.map(a => [
            <div><div className="font-semibold text-white text-sm">{a.applicantName}</div><div className="text-white/35 text-[10px]">{a.applicantEmail}</div></div>,
            <span className="text-white/70 text-xs max-w-[140px] truncate block">{a.jobTitle}</span>,
            <span className="text-white/45 text-xs">{a.employerName}</span>,
            <Badge v={a.status} />,
            <span className="text-white/35 text-xs">{new Date(a.createdAt).toLocaleDateString()}</span>,
            <select value={a.status} onChange={e => setStatus(a.id, e.target.value)}
              className="text-[10px] rounded-lg px-2 py-1 cursor-pointer outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: `1px solid ${BORDER}` }}>
              {["pending","shortlisted","accepted","rejected","withdrawn"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>,
          ])}
        />
      )}
    </div>
  );
}

// ── CONTACTS ──────────────────────────────────────────────────────────────────
function ContactsSection() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(() => { setLoading(true); api("/admin/contacts").then(setContacts).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  const del = async (id: number) => {
    try { await api(`/admin/contacts/${id}`, { method: "DELETE" }); setContacts(c => c.filter(x => x.id !== id)); setExpanded(null); }
    catch { alert("Failed."); }
  };
  const filtered = contacts.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader title="Contact Enquiries" onRefresh={load} />
      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, type…" />
        <span className="text-white/30 text-xs ml-auto">{filtered.length} enquiries</span>
      </div>
      {loading ? <Spin /> : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-white/25 text-sm text-center py-12">No enquiries yet.</p>}
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/03" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: "#a855f718", color: "#a855f7" }}>
                  {(c.name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{c.name}</span>
                    {c.company && <span className="text-white/35 text-xs">· {c.company}</span>}
                    <Badge v={c.emailSent ?? "skipped"} />
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {c.email} · <span style={{ color: MARIGOLD }}>{c.type}</span> · {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Confirm label="Delete" onClick={() => del(c.id)} />
                  <ChevronDown className={`h-4 w-4 text-white/20 transition-transform ${expanded === c.id ? "rotate-180" : ""}`} />
                </div>
              </div>
              {expanded === c.id && (
                <div className="px-5 pb-5 pt-1" style={{ borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                  {c.phone && <div className="text-xs text-white/40 mb-3">📞 {c.phone}</div>}
                  {c.message
                    ? <div className="text-sm text-white/65 leading-relaxed p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)` }}>{c.message}</div>
                    : <div className="text-xs text-white/25 italic">No message provided.</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CV REVIEWS ────────────────────────────────────────────────────────────────
function CvReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => { setLoading(true); api("/admin/cv-reviews").then(setReviews).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: string) => {
    try {
      await api(`/admin/cv-reviews/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      setReviews(r => r.map(x => x.id === id ? { ...x, status } : x));
    } catch { alert("Failed to update status."); }
  };

  const filtered = reviews.filter(r => filter === "all" || r.paymentStatus === filter);
  const totalRevenue = reviews.filter(r => r.paymentStatus === "paid").length * 15;

  return (
    <div>
      <SectionHeader title="CV Reviews" onRefresh={load} />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Reviews" value={reviews.length} icon={Star} accent={CORAL} />
        <KpiCard label="Paid Reviews" value={reviews.filter(r => r.paymentStatus === "paid").length} icon={CheckCircle} accent="#4ade80" />
        <KpiCard label="Revenue" value={`$${totalRevenue}`} icon={DollarSign} accent={MARIGOLD} />
      </div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1 rounded-xl p-0.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}` }}>
          {["all", "paid", "none"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
              style={{ background: filter === f ? CORAL : "transparent", color: filter === f ? "white" : "rgba(255,255,255,0.35)" }}>
              {f === "none" ? "Unpaid" : f}
            </button>
          ))}
        </div>
        <span className="text-white/30 text-xs ml-auto">{filtered.length} reviews</span>
      </div>
      {loading ? <Spin /> : (
        <Table
          cols={["User", "Email", "File", "Review Status", "Payment", "Revenue", "Date", "Update Status"]}
          empty="No CV reviews yet."
          rows={filtered.map(r => [
            <span className="font-semibold text-white">{r.userName}</span>,
            <span className="text-white/45 text-xs">{r.userEmail}</span>,
            <span className="text-white/45 text-xs max-w-[120px] truncate block">{r.cvFileName || "—"}</span>,
            <Badge v={r.status ?? "pending"} />,
            <Badge v={r.paymentStatus ?? "none"} />,
            r.revenue > 0
              ? <span className="font-bold text-green-400 text-sm">${r.revenue}</span>
              : <span className="text-white/25 text-xs">Free</span>,
            <span className="text-white/35 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>,
            <select value={r.status ?? "pending"} onChange={e => setStatus(r.id, e.target.value)}
              className="text-[10px] rounded-lg px-2 py-1 cursor-pointer outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: `1px solid ${BORDER}` }}>
              {["pending", "in_review", "reviewed"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>,
          ])}
        />
      )}
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function NotificationsSection() {
  const [segment, setSegment] = useState<"all" | "employers" | "job_seekers" | "admins">("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState<"compose" | "preview">("compose");
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    setPreviewCount(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api(`/admin/notifications/preview-count?segment=${segment}`).then(r => setPreviewCount(r.count)).catch(() => {});
    }, 400);
  }, [segment]);

  const send = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true); setResult(null);
    try {
      const r = await api("/admin/notifications/broadcast", { method: "POST", body: JSON.stringify({ subject, message, segment }) });
      setResult(r);
      if (r.success && r.sent > 0) { setSubject(""); setMessage(""); }
    } catch { setResult({ error: "Send failed. Check server logs." }); }
    setSending(false);
  };

  const segments = [
    { id: "all", label: "All Users", icon: Users, color: CORAL },
    { id: "employers", label: "Employers", icon: Briefcase, color: TEAL },
    { id: "job_seekers", label: "Job Seekers", icon: FileText, color: MARIGOLD },
    { id: "admins", label: "Admins Only", icon: Shield, color: "#a855f7" },
  ] as const;

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Send Notification" />

      {/* Segment picker */}
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Audience</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {segments.map(s => (
            <button key={s.id} onClick={() => setSegment(s.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
              style={{
                background: segment === s.id ? `${s.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${segment === s.id ? s.color + "50" : BORDER}`,
              }}>
              <s.icon className="h-5 w-5" style={{ color: segment === s.id ? s.color : "rgba(255,255,255,0.3)" }} />
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: segment === s.id ? "white" : "rgba(255,255,255,0.35)" }}>{s.label}</span>
            </button>
          ))}
        </div>
        {previewCount !== null && (
          <p className="text-xs mt-2" style={{ color: MARIGOLD }}>
            📨 This will send to <strong>{previewCount}</strong> verified {segment === "all" ? "users" : segment.replace("_", " ")}.
          </p>
        )}
      </div>

      {/* Compose / Preview tabs */}
      <div className="flex gap-1 mb-4 rounded-xl p-0.5 w-fit" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}` }}>
        {(["compose", "preview"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
            style={{ background: tab === t ? CORAL : "transparent", color: tab === t ? "white" : "rgba(255,255,255,0.4)" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Important Update from Bridgepath Africa"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder:text-white/20"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}` }} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
              placeholder="Write your message here. This will appear in the body of the email sent to your selected audience."
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder:text-white/20 resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}` }} />
            <div className="text-right text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>{message.length} chars</div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", borderBottom: `1px solid ${BORDER}` }}>Email Preview</div>
          <div className="p-5 space-y-3 text-sm" style={{ background: "#F2EDE6", color: "#1E1511" }}>
            <div className="inline-block px-3 py-1.5 rounded-lg font-black text-xs" style={{ background: CORAL, color: CREAM }}>Bridgepath Africa</div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: MARIGOLD }}>Announcement</div>
            <div className="text-xl font-black">{subject || "(No subject)"}</div>
            <div className="text-sm text-gray-700">Hi {"<First Name>"},</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{message || "(No message yet)"}</div>
            <div className="inline-block mt-2 px-5 py-2.5 rounded-lg font-bold text-xs text-white" style={{ background: CORAL }}>Visit Platform →</div>
          </div>
        </div>
      )}

      <button
        onClick={send}
        disabled={sending || !subject.trim() || !message.trim()}
        className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm transition-all"
        style={{
          background: !subject.trim() || !message.trim() ? "rgba(255,255,255,0.05)" : CORAL,
          color: !subject.trim() || !message.trim() ? "rgba(255,255,255,0.2)" : "white",
          cursor: !subject.trim() || !message.trim() ? "not-allowed" : "pointer",
        }}>
        {sending ? <><RefreshCw className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Notification</>}
        {!sending && previewCount !== null && ` (${previewCount} recipients)`}
      </button>

      {result && (
        <div className="mt-4 rounded-2xl p-4" style={{
          background: result.error ? "#dc262618" : "#16a34a18",
          border: `1px solid ${result.error ? "#dc262640" : "#16a34a40"}`,
        }}>
          {result.error
            ? <div className="flex items-center gap-2 text-red-400 text-sm"><AlertTriangle className="h-4 w-4" /> {result.error}</div>
            : <div className="space-y-1">
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold"><CheckCircle className="h-4 w-4" /> Notification sent!</div>
                <div className="text-xs text-white/50">✅ Sent: {result.sent} · ❌ Failed: {result.failed} · 📨 Total: {result.total}</div>
                {result.failed > 0 && <div className="text-xs text-yellow-400/70">Some sends failed — Resend may not be configured, or those addresses bounced.</div>}
              </div>
          }
        </div>
      )}
    </div>
  );
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick, accent = CORAL }: { icon: any; label: string; active: boolean; onClick: () => void; accent?: string }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm"
      style={{
        background: active ? `${accent}18` : "transparent",
        color: active ? "white" : "rgba(255,255,255,0.40)",
        fontWeight: active ? 700 : 500,
        borderLeft: `2px solid ${active ? accent : "transparent"}`,
        paddingLeft: 10,
      }}>
      <Icon className="h-4 w-4 shrink-0" style={{ color: active ? accent : "rgba(255,255,255,0.30)" }} />
      {label}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
    </div>
  );

  if (user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: NAVY }}>
      <div className="text-center px-6">
        <div className="h-16 w-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${CORAL}18`, border: `1px solid ${CORAL}30` }}>
          <Shield className="h-8 w-8" style={{ color: CORAL }} />
        </div>
        <p className="text-white font-bold text-lg mb-2">Admin Access Only</p>
        <p className="text-white/40 text-sm mb-6">You don't have permission to view this page.</p>
        <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: CORAL }}>Go Home</button>
      </div>
    </div>
  );

  const navSections: { id: Section; label: string; icon: any; accent?: string }[] = [
    { id: "overview",       label: "Overview",        icon: LayoutDashboard },
    { id: "revenue",        label: "Revenue",         icon: DollarSign,  accent: "#4ade80" },
    { id: "users",          label: "Users",           icon: Users,       accent: TEAL },
    { id: "jobs",           label: "Jobs",            icon: Briefcase,   accent: TEAL },
    { id: "applications",   label: "Applications",    icon: FileText,    accent: MARIGOLD },
    { id: "contacts",       label: "Enquiries",       icon: Mail,        accent: "#a855f7" },
    { id: "cvreviews",      label: "CV Reviews",      icon: Star,        accent: MARIGOLD },
    { id: "notifications",  label: "Notifications",   icon: Bell,        accent: CORAL },
  ];

  const sectionLabels: Record<Section, string> = {
    overview: "Platform Overview", revenue: "Revenue", users: "Users",
    jobs: "Jobs", applications: "Applications", contacts: "Enquiries",
    cvreviews: "CV Reviews", notifications: "Notifications",
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR }}>
      {/* Brand */}
      <div className="px-4 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: CORAL }}>
            <img src="/logo-b.png" alt="B" className="h-5 w-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <div>
            <div className="text-white font-extrabold text-sm leading-tight">BridgePath Africa</div>
            <div className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: CORAL }}>Admin Console</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>Platform</div>
        {navSections.slice(0, 2).map(s => (
          <NavItem key={s.id} icon={s.icon} label={s.label} active={section === s.id} onClick={() => { setSection(s.id); setMobileOpen(false); }} accent={s.accent} />
        ))}
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-2 mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>Content</div>
        {navSections.slice(2, 7).map(s => (
          <NavItem key={s.id} icon={s.icon} label={s.label} active={section === s.id} onClick={() => { setSection(s.id); setMobileOpen(false); }} accent={s.accent} />
        ))}
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] px-3 mb-2 mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>Tools</div>
        {navSections.slice(7).map(s => (
          <NavItem key={s.id} icon={s.icon} label={s.label} active={section === s.id} onClick={() => { setSection(s.id); setMobileOpen(false); }} accent={s.accent} />
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${CORAL}25`, color: CORAL }}>
            {(user.name ?? "A")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white/80 truncate">{user.name}</div>
            <div className="text-[10px] text-white/25 truncate">{user.email}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/05 transition-colors"
          style={{ color: "rgba(255,255,255,0.30)" }}>
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: NAVY }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen" style={{ borderRight: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full relative"><SidebarContent /></div>
          <button className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-40 flex items-center gap-4 px-5 py-3.5" style={{ background: NAVY, borderBottom: `1px solid ${BORDER}`, backdropFilter: "blur(12px)" }}>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/08" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-white/60" />
          </button>

          <div className="flex items-center gap-2 text-xs text-white/25">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/60 font-semibold">{sectionLabels[section]}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-green-400">Live</span>
            </div>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 px-5 py-7 max-w-7xl w-full mx-auto">
          {section === "overview"      && <OverviewSection />}
          {section === "revenue"       && <RevenueSection />}
          {section === "users"         && <UsersSection />}
          {section === "jobs"          && <JobsSection />}
          {section === "applications"  && <ApplicationsSection />}
          {section === "contacts"      && <ContactsSection />}
          {section === "cvreviews"     && <CvReviewsSection />}
          {section === "notifications" && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
}
