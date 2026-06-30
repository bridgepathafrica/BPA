import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useListJobs } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Briefcase, DollarSign, Clock, X, SlidersHorizontal,
  Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, Building2, Globe, CheckCircle2, Filter, ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

const INDUSTRIES = [
  "All Industries", "Technology", "Banking & Finance", "FinTech",
  "Healthcare", "Engineering", "Telecommunications", "E-Commerce",
  "Manufacturing", "Advertising", "NGO / Development",
];

const SALARY_RANGES = [
  { label: "Any Salary", min: 0, max: Infinity },
  { label: "Under $30k", min: 0, max: 30000 },
  { label: "$30k – $60k", min: 30000, max: 60000 },
  { label: "$60k – $100k", min: 60000, max: 100000 },
  { label: "$100k+", min: 100000, max: Infinity },
];

const JOB_TYPES = [
  { v: "all", l: "All Types" },
  { v: "full_time", l: "Full-time" },
  { v: "part_time", l: "Part-time" },
  { v: "contract", l: "Contract" },
  { v: "remote", l: "Remote" },
];

const COUNTRIES = ["All Countries", "Ghana", "Nigeria", "South Africa", "Uganda", "Tanzania", "Multiple"];

const mockJobs = [
  { id: 101, title: "Software Engineer (Full Stack)", employer: { name: "Andela" }, location: "Remote", country: "Africa", type: "remote", salaryMin: 70000, salaryMax: 110000, currency: "USD", industry: "Technology", skills: ["React", "Node.js", "PostgreSQL", "TypeScript"], createdAt: new Date().toISOString(), isActive: true },
  { id: 102, title: "Finance Manager", employer: { name: "Stanbic Bank" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 45000, salaryMax: 70000, currency: "USD", industry: "Banking & Finance", skills: ["Financial Analysis", "IFRS", "Excel", "Budgeting"], createdAt: new Date(Date.now() - 86400000).toISOString(), isActive: true },
  { id: 103, title: "Digital Marketing Specialist", employer: { name: "Jumia" }, location: "Lagos", country: "Nigeria", type: "full_time", salaryMin: 30000, salaryMax: 50000, currency: "USD", industry: "E-Commerce", skills: ["SEO", "Social Media", "Google Ads", "Analytics"], createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), isActive: true },
  { id: 104, title: "Supply Chain Analyst", employer: { name: "Dangote Group" }, location: "Abuja", country: "Nigeria", type: "full_time", salaryMin: 38000, salaryMax: 58000, currency: "USD", industry: "Manufacturing", skills: ["Supply Chain", "ERP", "Data Analysis", "Logistics"], createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), isActive: true },
  { id: 105, title: "Clinical Pharmacist", employer: { name: "Korle Bu Teaching Hospital" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 40000, salaryMax: 62000, currency: "USD", industry: "Healthcare", skills: ["Clinical Pharmacy", "Patient Care", "Drug Management"], createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), isActive: true },
  { id: 106, title: "Civil Engineer", employer: { name: "AECOM Africa" }, location: "Johannesburg", country: "South Africa", type: "full_time", salaryMin: 55000, salaryMax: 85000, currency: "USD", industry: "Engineering", skills: ["AutoCAD", "Project Management", "Structural Design", "Civil Works"], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), isActive: true },
  { id: 107, title: "HR Business Partner", employer: { name: "MTN Ghana" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 42000, salaryMax: 65000, currency: "USD", industry: "Telecommunications", skills: ["HR Strategy", "Employee Relations", "Change Management"], createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), isActive: true },
  { id: 108, title: "Sales Director – West Africa", employer: { name: "SAP Africa" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 80000, salaryMax: 130000, currency: "USD", industry: "Technology", skills: ["Enterprise Sales", "CRM", "B2B", "Deal Closing"], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), isActive: true },
  { id: 109, title: "Graphic Designer", employer: { name: "Ogilvy Africa" }, location: "Accra", country: "Ghana", type: "contract", salaryMin: 20000, salaryMax: 35000, currency: "USD", industry: "Advertising", skills: ["Adobe Creative Suite", "Figma", "Branding", "Typography"], createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), isActive: true },
  { id: 110, title: "Mobile App Developer (Android)", employer: { name: "M-KOPA" }, location: "Kampala", country: "Uganda", type: "full_time", salaryMin: 50000, salaryMax: 80000, currency: "USD", industry: "FinTech", skills: ["Kotlin", "Android SDK", "REST APIs", "Firebase"], createdAt: new Date(Date.now() - 9 * 86400000).toISOString(), isActive: true },
  { id: 111, title: "Country Director – Tanzania", employer: { name: "IRC – International Rescue Committee" }, location: "Dar es Salaam", country: "Tanzania", type: "full_time", salaryMin: 90000, salaryMax: 130000, currency: "USD", industry: "NGO / Development", skills: ["Program Management", "Fundraising", "Leadership", "Reporting"], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), isActive: true },
  { id: 112, title: "Backend Engineer (Python)", employer: { name: "Flutterwave" }, location: "Remote", country: "Multiple", type: "remote", salaryMin: 65000, salaryMax: 105000, currency: "USD", industry: "FinTech", skills: ["Python", "Django", "PostgreSQL", "AWS", "Redis"], createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), isActive: true },
];

type Job = typeof mockJobs[0];

function typeLabel(t: string) {
  return t === "full_time" ? "Full-time" : t === "part_time" ? "Part-time" : t.charAt(0).toUpperCase() + t.slice(1);
}

function companyInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const COMPANY_COLORS: Record<string, string> = {
  Andela: "#6366f1", "Equity Bank": "#0ea5e9", Jumia: "#f97316", "Dangote Group": "#84cc16",
  "Aga Khan University Hospital": "#14b8a6", "AECOM Africa": "#f59e0b", Safaricom: "#10b981",
  "SAP Africa": "#3b82f6", "Ogilvy Africa": "#e11d48", "M-KOPA": "#8b5cf6",
  "IRC – International Rescue Committee": "#06b6d4", Flutterwave: "#f43f5e",
};

function companyColor(name: string) {
  return COMPANY_COLORS[name] || TERRACOTTA;
}

function JobCard({ job, saved, onSave, isEmployer }: { job: Job; saved: boolean; onSave: () => void; isEmployer: boolean }) {
  const [, navigate] = useLocation();
  const daysAgo = Math.round((Date.now() - new Date(job.createdAt).getTime()) / 86400000);
  const postedText = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-lg transition-all duration-250 p-5 flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: companyColor(job.employer.name) }}
        >
          {companyInitials(job.employer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-base leading-snug truncate cursor-pointer hover:underline"
            style={{ color: INK }}
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {job.employer.name}
          </p>
        </div>
        <button
          onClick={onSave}
          className="shrink-0 p-2 rounded-lg transition-all hover:scale-110"
          style={{ color: saved ? TERRACOTTA : "#9ca3af" }}
          title={saved ? "Saved" : "Save job"}
        >
          {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0fdf4", color: "#15803d" }}>
          <MapPin className="h-3 w-3" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          <Briefcase className="h-3 w-3" /> {typeLabel(job.type)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: TERRACOTTA + "15", color: "#3d6e10" }}>
          <DollarSign className="h-3 w-3" /> ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <Clock className="h-3 w-3" /> {postedText}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map(s => (
          <span key={s} className="text-[11px] bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-[11px] text-gray-400 px-2 py-0.5">+{job.skills.length - 4} more</span>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
        <span className="text-xs text-gray-400">{job.industry}</span>
        {isEmployer ? (
          <Link href={`/jobs/${job.id}`}>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all hover:bg-gray-50" style={{ color: INK, borderColor: "#e5e7eb" }}>
              View <ExternalLink className="h-3 w-3" />
            </button>
          </Link>
        ) : (
          <button
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: TERRACOTTA }}
          >
            Apply now
          </button>
        )}
      </div>
    </motion.div>
  );
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <button className="flex items-center justify-between w-full text-left mb-3" onClick={() => setOpen(!open)}>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function DashboardJobs() {
  const { user } = useAuth();
  const isEmployer = user?.role === "employer";

  const [search, setSearch] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [type, setType] = useState("all");
  const [industry, setIndustry] = useState("All Industries");
  const [country, setCountry] = useState("All Countries");
  const [salaryIdx, setSalaryIdx] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "salary">("recent");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const debouncedLocation = useDebounce(locationVal, 350);

  const { data: apiData } = useListJobs(
    { search: debouncedSearch || undefined, location: debouncedLocation || undefined, type: type !== "all" ? type : undefined, limit: 20 },
    { query: { queryKey: ["dashboard-jobs", debouncedSearch, debouncedLocation, type] } }
  );

  const apiJobs = apiData?.jobs || [];
  const salaryRange = SALARY_RANGES[salaryIdx];

  const filtered = useMemo(() => {
    let jobs = [...apiJobs, ...mockJobs];
    if (tab === "saved") jobs = jobs.filter(j => savedIds.has(j.id));
    if (debouncedSearch) jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (j.employer?.name ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ((j as any).skills || []).some((s: string) => s.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
    if (debouncedLocation) jobs = jobs.filter(j =>
      j.location.toLowerCase().includes(debouncedLocation.toLowerCase()) ||
      j.country.toLowerCase().includes(debouncedLocation.toLowerCase())
    );
    if (type !== "all") jobs = jobs.filter(j => j.type === type);
    if (industry !== "All Industries") jobs = jobs.filter(j => (j as any).industry === industry);
    if (country !== "All Countries") jobs = jobs.filter(j => j.country === country);
    jobs = jobs.filter(j => (j as any).salaryMin >= salaryRange.min && (j as any).salaryMin <= salaryRange.max);
    if (sortBy === "salary") jobs = [...jobs].sort((a, b) => ((b as any).salaryMax || 0) - ((a as any).salaryMax || 0));
    return jobs;
  }, [apiJobs, debouncedSearch, debouncedLocation, type, industry, country, salaryIdx, sortBy, savedIds, tab]);

  const activeFilterCount = [type !== "all", industry !== "All Industries", country !== "All Countries", salaryIdx > 0].filter(Boolean).length;

  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setType("all");
    setIndustry("All Industries");
    setCountry("All Countries");
    setSalaryIdx(0);
  };

  const FilterPanel = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-0">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-bold flex items-center gap-2" style={{ color: INK }}>
          <Filter className="h-4 w-4" style={{ color: TERRACOTTA }} /> Filters
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Job Type">
        <div className="space-y-1">
          {JOB_TYPES.map(t => (
            <button
              key={t.v}
              onClick={() => setType(t.v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={type === t.v ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 } : { color: "#6b7280" }}
            >
              {t.l}
              {type === t.v && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Industry" defaultOpen={false}>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={industry === ind ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 } : { color: "#6b7280" }}
            >
              {ind}
              {industry === ind && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Country" defaultOpen={false}>
        <div className="space-y-1">
          {COUNTRIES.map(c => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={country === c ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 } : { color: "#6b7280" }}
            >
              {c}
              {country === c && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Salary Range" defaultOpen={false}>
        <div className="space-y-1">
          {SALARY_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setSalaryIdx(i)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
              style={salaryIdx === i ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 } : { color: "#6b7280" }}
            >
              {r.label}
              {salaryIdx === i && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: TERRACOTTA }}>
              {isEmployer ? "Talent & Jobs" : "Job Discovery"}
            </p>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: INK }}>
              {isEmployer ? "Browse the Job Board" : "Find Your Next Role"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEmployer
                ? "See what roles are live across Africa and what talent is looking for."
                : "Discover roles across Africa tailored to your career goals."}
            </p>
          </div>
          {!isEmployer && (
            <div className="flex items-center gap-2 shrink-0 px-4 py-3 rounded-xl" style={{ backgroundColor: TERRACOTTA + "12", border: `1px solid ${TERRACOTTA}30` }}>
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: TERRACOTTA }} />
              <p className="text-xs font-semibold" style={{ color: TERRACOTTA }}>CV Review boosts your match rate</p>
              <Link href="/cv-review" className="text-xs font-bold underline shrink-0" style={{ color: TERRACOTTA }}>Try it →</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Job title, skills, or company…"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-colors"
              style={{ "--tw-ring-color": TERRACOTTA + "55" } as any}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="relative sm:w-52">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={locationVal}
              onChange={e => setLocationVal(e.target.value)}
              placeholder="City, country, or Remote"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-colors"
              style={{ "--tw-ring-color": TERRACOTTA + "55" } as any}
            />
          </div>
          <button
            className="h-11 px-6 font-semibold text-sm text-white rounded-xl shrink-0 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: TERRACOTTA }}
          >
            Search
          </button>
        </div>

        {/* Quick type pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {JOB_TYPES.map(t => (
            <button
              key={t.v}
              onClick={() => setType(t.v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={type === t.v
                ? { backgroundColor: TERRACOTTA, borderColor: TERRACOTTA, color: "white" }
                : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#6b7280" }}
            >
              {t.l}
            </button>
          ))}
          <div className="h-auto w-px bg-gray-100 mx-0.5 self-stretch hidden sm:block" />
          {["Technology", "FinTech", "Healthcare"].map(ind => (
            <button
              key={ind}
              onClick={() => setIndustry(industry === ind ? "All Industries" : ind)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={industry === ind
                ? { backgroundColor: INK, borderColor: INK, color: "white" }
                : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#6b7280" }}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: sidebar + results ── */}
      <div className="flex gap-5 items-start">

        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-4">
          <FilterPanel />
        </aside>

        {/* Results column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Toolbar: tabs + count + sort + mobile filter toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1 self-start">
              {[{ k: "all", l: "All Roles" }, { k: "saved", l: `Saved${savedIds.size > 0 ? ` (${savedIds.size})` : ""}` }].map(t => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k as any)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={tab === t.k
                    ? { backgroundColor: INK, color: "white" }
                    : { color: "#6b7280" }}
                >
                  {t.l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white"
                style={{ color: activeFilterCount > 0 ? TERRACOTTA : "#6b7280" }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Sort */}
              <button
                onClick={() => setSortBy(sortBy === "recent" ? "salary" : "recent")}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortBy === "recent" ? "Most Recent" : "Highest Salary"}
              </button>

              <p className="text-xs text-gray-400 shrink-0">
                <span className="font-semibold text-gray-700">{filtered.length}</span> {filtered.length === 1 ? "role" : "roles"}
              </p>
            </div>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                key="mobile-filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden"
              >
                <FilterPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {type !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: TERRACOTTA }}>
                  {typeLabel(type)} <button onClick={() => setType("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {industry !== "All Industries" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: INK }}>
                  {industry} <button onClick={() => setIndustry("All Industries")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {country !== "All Countries" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-gray-700 text-white">
                  <Globe className="h-3 w-3" /> {country} <button onClick={() => setCountry("All Countries")}><X className="h-3 w-3" /></button>
                </span>
              )}
              {salaryIdx > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: TERRACOTTA + "20", color: "#3d6e10" }}>
                  <DollarSign className="h-3 w-3" /> {SALARY_RANGES[salaryIdx].label} <button onClick={() => setSalaryIdx(0)}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Job cards grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: TERRACOTTA + "15" }}>
                <Search className="h-6 w-6" style={{ color: TERRACOTTA }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: INK }}>
                {tab === "saved" ? "No saved jobs yet" : "No roles match your filters"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {tab === "saved"
                  ? "Bookmark roles you're interested in using the save icon on each card."
                  : "Try adjusting your search or clearing some filters."}
              </p>
              {tab === "saved" ? (
                <button onClick={() => setTab("all")} className="text-sm font-semibold" style={{ color: TERRACOTTA }}>
                  Browse all roles →
                </button>
              ) : (
                <button onClick={clearAll} className="text-sm font-semibold" style={{ color: TERRACOTTA }}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map(job => (
                  <JobCard
                    key={job.id}
                    job={job as any}
                    saved={savedIds.has(job.id)}
                    onSave={() => toggleSave(job.id)}
                    isEmployer={isEmployer}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
