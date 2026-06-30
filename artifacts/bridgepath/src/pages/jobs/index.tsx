import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListJobs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, DollarSign, Clock, X, SlidersHorizontal, ChevronDown, Bookmark } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { useAuth } from "@/lib/auth";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const INDUSTRIES = [
  "All Industries",
  "Technology",
  "Banking & Finance",
  "FinTech",
  "Healthcare",
  "Engineering",
  "Telecommunications",
  "E-Commerce",
  "Manufacturing",
  "Advertising",
  "NGO / Development",
];

const SALARY_RANGES = [
  { label: "Any Salary", min: 0, max: Infinity },
  { label: "Under $30k", min: 0, max: 30000 },
  { label: "$30k – $60k", min: 30000, max: 60000 },
  { label: "$60k – $100k", min: 60000, max: 100000 },
  { label: "$100k+", min: 100000, max: Infinity },
];

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

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

function ApplyModal({ open, onClose, jobTitle }: { open: boolean; onClose: () => void; jobTitle: string }) {
  const [, setLocation] = useLocation();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="relative">
          <div className="h-36 flex items-center justify-center" style={{ backgroundColor: INK }}>
            <div className="text-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: TERRACOTTA }}>
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: INK }}>Create an account to apply</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign up free and apply to <span className="font-semibold text-gray-700">"{jobTitle}"</span> in seconds. Track all your applications from your dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setLocation("/auth/signup")}
              className="w-full py-3 font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: TERRACOTTA }}
            >
              Create Free Account
            </button>
            <button
              onClick={() => setLocation("/auth/login")}
              className="w-full py-3 font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              I already have an account
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">Free to join • No credit card required</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function JobsList() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [type, setType] = useState<string>("all");
  const [industry, setIndustry] = useState("All Industries");
  const [salaryIdx, setSalaryIdx] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "salary">("recent");
  const [applyJob, setApplyJob] = useState<{ id: number; title: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { isAuthenticated } = useAuth();
  const { savedIds, toggleSave } = useSavedJobs(isAuthenticated);
  const debouncedSearch = useDebounce(search, 400);
  const debouncedLocation = useDebounce(locationVal, 400);

  const { data: apiData, isLoading } = useListJobs({
    search: debouncedSearch || undefined,
    location: debouncedLocation || undefined,
    type: type !== "all" ? type : undefined,
    limit: 20
  }, { query: { queryKey: ["jobs", debouncedSearch, debouncedLocation, type] } });

  const apiJobs = apiData?.jobs || [];
  const salaryRange = SALARY_RANGES[salaryIdx];

  const filteredMock = mockJobs.filter(j => {
    const matchSearch = !debouncedSearch || j.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || j.employer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchLocation = !debouncedLocation || j.location.toLowerCase().includes(debouncedLocation.toLowerCase()) || j.country.toLowerCase().includes(debouncedLocation.toLowerCase());
    const matchType = type === "all" || j.type === type;
    const matchIndustry = industry === "All Industries" || j.industry === industry;
    const matchSalary = j.salaryMin >= salaryRange.min && j.salaryMin <= salaryRange.max;
    return matchSearch && matchLocation && matchType && matchIndustry && matchSalary;
  });

  const baseJobs = apiJobs.length > 0 ? apiJobs : filteredMock;
  let allJobs = apiJobs.length > 0
    ? baseJobs.filter((j: any) => {
        const matchSalary = !salaryRange.min || (j.salaryMin >= salaryRange.min && j.salaryMin <= salaryRange.max);
        const matchIndustry = industry === "All Industries" || j.industry === industry;
        const matchType = type === "all" || j.type === type;
        const matchSearch = !debouncedSearch || j.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || j.employer?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchLocation = !debouncedLocation || j.location?.toLowerCase().includes(debouncedLocation.toLowerCase()) || j.country?.toLowerCase().includes(debouncedLocation.toLowerCase());
        return matchSalary && matchIndustry && matchType && matchSearch && matchLocation;
      })
    : baseJobs;
  if (sortBy === "salary") {
    allJobs = allJobs.sort((a: any, b: any) => ((b.salaryMax || 0) - (a.salaryMax || 0)));
  }
  const totalCount = allJobs.length;

  const activeFilters = [
    type !== "all" && { key: "type", label: type.replace("_", "-") },
    industry !== "All Industries" && { key: "industry", label: industry },
    salaryIdx > 0 && { key: "salary", label: SALARY_RANGES[salaryIdx].label },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearFilter = (key: string) => {
    if (key === "type") setType("all");
    if (key === "industry") setIndustry("All Industries");
    if (key === "salary") setSalaryIdx(0);
  };

  const handleApply = (job: { id: number; title: string }) => {
    if (!isAuthenticated) setApplyJob(job);
    else navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageSEO
        title="Find Jobs in Africa | Pan-African Job Listings | Bridgepath Network"
        description="Browse vetted job opportunities across Africa. Apply to roles in tech, finance, HR, operations and more with Bridgepath Network."
        path="/jobs"
        breadcrumbs={[{ name: "Find Jobs", path: "/jobs" }]}
      />
      <Navbar />

      {/* ── HERO SEARCH BAR ── */}
      <div className="py-14" style={{ background: INK }}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#C04020" }}>Open Roles</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Find Jobs Across Africa</h1>
            <p className="text-gray-400 text-base">Discover roles at leading companies across Africa and globally</p>
          </div>

          {/* Main search row */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2 bg-white p-2.5 rounded-2xl shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company…"
                  className="w-full pl-10 pr-3 h-12 text-sm bg-gray-50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary/30"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="h-12 w-px bg-gray-100 hidden md:block self-center" />
              <div className="relative flex-1 md:max-w-[220px]">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City, country, or Remote"
                  className="w-full pl-10 pr-3 h-12 text-sm bg-gray-50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary/30"
                  value={locationVal}
                  onChange={e => setLocationVal(e.target.value)}
                />
              </div>
              <button className="h-12 px-7 font-semibold text-white rounded-xl shrink-0 hover:opacity-90 transition-opacity text-sm" style={{ backgroundColor: TERRACOTTA }}>
                Search Jobs
              </button>
            </div>

            {/* Quick filter pills row */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Job type pills */}
              {[{ v: "all", l: "All Types" }, { v: "full_time", l: "Full-time" }, { v: "remote", l: "Remote" }, { v: "contract", l: "Contract" }].map(t => (
                <button
                  key={t.v}
                  onClick={() => setType(t.v)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={type === t.v
                    ? { backgroundColor: TERRACOTTA, borderColor: TERRACOTTA, color: "white" }
                    : { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}
                >
                  {t.l}
                </button>
              ))}
              <div className="h-5 w-px bg-white/20 mx-1 hidden sm:block" />
              {/* Industry quick pills */}
              {["Technology", "Finance", "FinTech", "Healthcare"].map(ind => (
                <button
                  key={ind}
                  onClick={() => setIndustry(industry === ind ? "All Industries" : ind)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={industry === ind
                    ? { backgroundColor: "#1e3d3a", borderColor: "#1e3d3a", color: TERRACOTTA }
                    : { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className={`lg:w-64 shrink-0 space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: INK }}>
                  <SlidersHorizontal className="h-4 w-4" style={{ color: TERRACOTTA }} /> Filters
                </h3>
                {activeFilters.length > 0 && (
                  <button onClick={() => { setType("all"); setIndustry("All Industries"); setSalaryIdx(0); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              {/* Industry */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Industry</p>
                <div className="space-y-1">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={industry === ind
                        ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 }
                        : { color: "#6b7280" }}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary range */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary Range</p>
                <div className="space-y-1">
                  {SALARY_RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setSalaryIdx(i)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={salaryIdx === i
                        ? { backgroundColor: TERRACOTTA + "15", color: TERRACOTTA, fontWeight: 600 }
                        : { color: "#6b7280" }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job type */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Type</p>
                <div className="space-y-1">
                  {[{ v: "all", l: "All Types" }, { v: "full_time", l: "Full-time" }, { v: "part_time", l: "Part-time" }, { v: "contract", l: "Contract" }, { v: "remote", l: "Remote" }].map(t => (
                    <button
                      key={t.v}
                      onClick={() => setType(t.v)}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                      style={type === t.v
                        ? { backgroundColor: INK + "12", color: INK, fontWeight: 600 }
                        : { color: "#6b7280" }}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Employer CTA */}
            <div className="rounded-2xl p-5 text-white" style={{ background: INK }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TERRACOTTA }}>Hiring?</p>
              <p className="font-semibold text-sm mb-3">Post a role and reach top African talent</p>
              <Link href="/employers">
                <button className="w-full py-2 text-xs font-bold rounded-xl text-white border border-white/20 hover:bg-white/10 transition-colors">
                  Post a Job →
                </button>
              </Link>
            </div>
          </aside>

          {/* ── JOBS LIST ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors"
                  style={{ borderColor: TERRACOTTA + "50", color: TERRACOTTA, backgroundColor: TERRACOTTA + "10" }}
                  onClick={() => setShowFilters(f => !f)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {showFilters ? "Hide Filters" : "Filters"}
                  {activeFilters.length > 0 && <span className="h-4 w-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: TERRACOTTA }}>{activeFilters.length}</span>}
                </button>
                <h2 className="text-sm font-semibold text-gray-700">
                  {isLoading ? "Loading…" : <><span className="font-bold text-lg" style={{ color: TERRACOTTA }}>{totalCount}</span> {totalCount === 1 ? "job" : "jobs"} found</>}
                </h2>
                {activeFilters.map(f => (
                  <span key={f.key} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: TERRACOTTA + "15", color: TERRACOTTA }}>
                    {f.label}
                    <button onClick={() => clearFilter(f.key)} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-500 hidden sm:block">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "recent" | "salary")}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary">Salary (High–Low)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-28" />
                ))
              ) : allJobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Briefcase className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-600 mb-1">No jobs match your filters</h3>
                  <p className="text-sm text-gray-400 mb-4">Try broadening your search or clearing a filter</p>
                  <button onClick={() => { setSearch(""); setLocationVal(""); setType("all"); setIndustry("All Industries"); setSalaryIdx(0); }}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ backgroundColor: TERRACOTTA }}>
                    Clear All Filters
                  </button>
                </div>
              ) : allJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all p-5 group cursor-pointer" onClick={() => handleApply({ id: job.id, title: job.title })}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-base" style={{ backgroundColor: INK + "10", color: INK }}>
                      {job.employer?.name?.[0] || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors leading-snug">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">{job.employer?.name}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                            <span className="flex items-center gap-1 capitalize"><Briefcase className="h-3 w-3" />{(job.type as string).replace("_", "-")}</span>
                            {(job as any).salaryMin && (job as any).salaryMax && (
                              <span className="flex items-center gap-1 font-semibold" style={{ color: TERRACOTTA }}>
                                <DollarSign className="h-3 w-3" />{(job as any).currency} {((job as any).salaryMin / 1000).toFixed(0)}k–{((job as any).salaryMax / 1000).toFixed(0)}k
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-gray-300"><Clock className="h-3 w-3" />{format(new Date(job.createdAt), "MMM d")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              if (!isAuthenticated) { setApplyJob({ id: job.id, title: job.title }); return; }
                              toggleSave(job.id);
                            }}
                            title={savedIds.has(job.id) ? "Remove from saved" : "Save job"}
                            className="h-8 w-8 flex items-center justify-center rounded-xl border transition-all hover:scale-105"
                            style={savedIds.has(job.id)
                              ? { backgroundColor: TERRACOTTA + "18", borderColor: TERRACOTTA + "50", color: TERRACOTTA }
                              : { backgroundColor: "white", borderColor: "#e5e7eb", color: "#9ca3af" }}
                          >
                            <Bookmark className="h-4 w-4" fill={savedIds.has(job.id) ? TERRACOTTA : "none"} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleApply({ id: job.id, title: job.title }); }}
                            className="shrink-0 px-4 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: TERRACOTTA }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(job as any).skills?.slice(0, 5).map((skill: string) => (
                          <span key={skill} className="text-[11px] px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-500 bg-gray-50">{skill}</span>
                        ))}
                        {(job as any).skills && (job as any).skills.length > 5 && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-gray-200 text-gray-400">+{(job as any).skills.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {applyJob && (
        <ApplyModal
          open={!!applyJob}
          onClose={() => setApplyJob(null)}
          jobTitle={applyJob.title}
        />
      )}
    </div>
  );
}
