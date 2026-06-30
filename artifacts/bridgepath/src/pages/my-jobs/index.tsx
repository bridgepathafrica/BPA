import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { isDemoEmail } from "@/lib/demoAuth";
import { useListJobs } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  PlusCircle, Search, Briefcase, MapPin, DollarSign, Clock,
  Users, Eye, KanbanSquare, Power, PowerOff, Pencil, Trash2,
  ChevronDown, ChevronUp, Check, X, Loader2, Sparkles, AlertTriangle,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

const LOCATIONS = [
  "Remote", "Ghana", "Nigeria", "South Africa",
  "Egypt", "Ethiopia", "Tanzania", "Uganda", "Senegal", "Rwanda", "Multiple",
];

const DEMO_JOBS = [
  {
    id: 201, title: "Senior Software Engineer", location: "Remote", country: "Remote",
    type: "remote", industry: "Technology", salaryMin: 70000, salaryMax: 110000,
    currency: "USD", applicantCount: 18, isActive: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    description: "Join our team to build scalable products serving the African market.",
    requirements: "5+ years of full-stack experience.\nStrong React and Node.js skills.\nExperience with cloud platforms.",
  },
  {
    id: 202, title: "Product Manager", location: "Accra, GH", country: "Ghana",
    type: "full_time", industry: "Technology", salaryMin: 55000, salaryMax: 85000,
    currency: "USD", applicantCount: 12, isActive: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    skills: ["Agile", "Roadmapping", "Analytics", "Stakeholder Management"],
    description: "Lead product strategy and execution for our core hiring platform.",
    requirements: "4+ years of PM experience.\nProven track record shipping products.\nStrong data literacy.",
  },
  {
    id: 203, title: "HR Business Partner", location: "Lagos, NG", country: "Nigeria",
    type: "full_time", industry: "NGO / Development", salaryMin: 40000, salaryMax: 65000,
    currency: "USD", applicantCount: 9, isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    skills: ["HR Strategy", "Employee Relations", "HRIS", "Change Management"],
    description: "Partner with leadership to drive people strategy across West Africa operations.",
    requirements: "4+ years as an HRBP.\nCIPD or SHRM certification preferred.\nExperience in large orgs.",
  },
  {
    id: 204, title: "Data Analyst", location: "Accra, GH", country: "Ghana",
    type: "full_time", industry: "Technology", salaryMin: 35000, salaryMax: 55000,
    currency: "USD", applicantCount: 8, isActive: false,
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    skills: ["SQL", "Python", "Tableau", "Power BI"],
    description: "Analyse hiring trends and platform data to drive business decisions.",
    requirements: "3+ years of data analysis experience.\nStrong SQL and Python.\nExperience with BI tools.",
  },
];

type DemoJob = typeof DEMO_JOBS[number];

function typeLabel(t: string) {
  return t === "full_time" ? "Full-time"
    : t === "part_time" ? "Part-time"
    : t === "contract" ? "Contract"
    : t === "internship" ? "Internship"
    : t === "remote" ? "Remote"
    : t;
}

function DeleteConfirm({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Delete this job?</h3>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">The listing will be permanently removed and candidates will no longer be able to apply.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete Job
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EditForm {
  title: string; location: string; type: string;
  salaryMin: string; salaryMax: string; currency: string;
  description: string; requirements: string;
}

function JobCard({
  job, isDemo, onToggleActive, onDelete, togglingId, deletingId,
}: {
  job: any; isDemo: boolean;
  onToggleActive: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
  togglingId: number | null; deletingId: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: job.title,
    location: job.location,
    type: job.type,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    currency: job.currency ?? "USD",
    description: job.description ?? "",
    requirements: job.requirements ?? "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EditForm>) => {
      if (isDemo) return { ...job, ...data };
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editForm.title,
          location: editForm.location,
          country: editForm.location,
          type: editForm.type,
          currency: editForm.currency,
          salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : undefined,
          salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : undefined,
          description: editForm.description,
          requirements: editForm.requirements,
        }),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isDemo ? "Changes saved (demo)" : "Job updated", description: isDemo ? "In demo mode, changes are not persisted." : "Your listing has been updated." });
      queryClient.invalidateQueries({ queryKey: ["dashboardJobs"] });
      setExpanded(false);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Update failed", description: "Could not save changes." });
    },
  });

  const isToggling = togglingId === job.id;
  const isDeleting = deletingId === job.id;

  return (
    <>
      {showDelete && (
        <DeleteConfirm
          onConfirm={() => { onDelete(job.id); setShowDelete(false); }}
          onCancel={() => setShowDelete(false)}
          loading={isDeleting}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Main row */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon + info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 text-white" style={{ backgroundColor: job.isActive ? TERRACOTTA : "#9ca3af" }}>
                {job.title[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={job.isActive
                      ? { backgroundColor: TERRACOTTA + "20", color: TERRACOTTA }
                      : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}
                  >
                    {job.isActive ? "Active" : "Closed"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {typeLabel(job.type)}
                  </span>
                  {job.salaryMin && job.salaryMax && (
                    <span className="flex items-center gap-1 font-semibold" style={{ color: TERRACOTTA }}>
                      <DollarSign className="h-3 w-3" />
                      {job.currency} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-600">
                    <Users className="h-3 w-3" /> {job.applicantCount ?? 0} applicant{(job.applicantCount ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href={`/jobs/${job.id}`}>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </Link>
              <Link href="/dashboard/pipeline">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
                  <KanbanSquare className="h-3.5 w-3.5" /> Applicants
                </button>
              </Link>
              <button
                onClick={() => onToggleActive(job.id, job.isActive)}
                disabled={isToggling}
                title={job.isActive ? "Close listing" : "Reopen listing"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50"
                style={job.isActive
                  ? { borderColor: "#fca5a5", color: "#ef4444", backgroundColor: "#fef2f2" }
                  : { borderColor: "#6ee7b7", color: "#059669", backgroundColor: "#ecfdf5" }}
              >
                {isToggling
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : job.isActive
                    ? <><PowerOff className="h-3.5 w-3.5" /> Close</>
                    : <><Power className="h-3.5 w-3.5" /> Reopen</>
                }
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setShowDelete(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && !expanded && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills ?? "[]")).slice(0, 5).map((skill: string, i: number) => (
                <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium border"
                  style={{ backgroundColor: TERRACOTTA + "08", color: TERRACOTTA, borderColor: TERRACOTTA + "25" }}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Inline Edit Form */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edit Listing</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Job Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Job title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                <Select value={editForm.location} onValueChange={(v) => setEditForm({ ...editForm, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Job Type</label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency</label>
                <Select value={editForm.currency} onValueChange={(v) => setEditForm({ ...editForm, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "KES", "GHS", "NGN", "ZAR", "EGP"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Salary</label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={editForm.salaryMin}
                    onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Salary</label>
                  <Input
                    type="number"
                    placeholder="80000"
                    value={editForm.salaryMax}
                    onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <Textarea
                  className="min-h-[100px] resize-y text-sm"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Job description..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Requirements</label>
                <Textarea
                  className="min-h-[80px] resize-y text-sm"
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  placeholder="Requirements..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => updateMutation.mutate(editForm)}
                disabled={updateMutation.isPending || !editForm.title.trim()}
                style={{ backgroundColor: TERRACOTTA }}
                className="text-white hover:opacity-90"
              >
                {updateMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...</>
                  : <><Check className="h-4 w-4 mr-1.5" /> Save Changes</>
                }
              </Button>
              <Button size="sm" variant="outline" onClick={() => setExpanded(false)}>
                <X className="h-4 w-4 mr-1.5" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function MyJobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = isDemoEmail(user?.email);

  const [tab, setTab] = useState<"all" | "active" | "closed">("all");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [demoJobs, setDemoJobs] = useState<typeof DEMO_JOBS>(DEMO_JOBS);

  const { data: jobsResponse, isLoading } = useListJobs(
    { limit: 100 },
    { query: { queryKey: ["myJobsList"], enabled: !isDemo } }
  );

  const allJobs: any[] = isDemo ? demoJobs : (jobsResponse?.jobs ?? []);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      if (isDemo) return { id, isActive: !isActive };
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      return res.json();
    },
    onSuccess: (data, vars) => {
      if (isDemo) {
        setDemoJobs((prev) => prev.map((j) => j.id === vars.id ? { ...j, isActive: !vars.isActive } : j));
        toast({
          title: vars.isActive ? "Listing closed (demo)" : "Listing reopened (demo)",
          description: "Demo mode — changes are not persisted.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["myJobsList"] });
        toast({ title: vars.isActive ? "Listing closed" : "Listing reopened" });
      }
      setTogglingId(null);
    },
    onError: () => {
      setTogglingId(null);
      toast({ variant: "destructive", title: "Action failed", description: "Could not update listing status." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isDemo) return { id };
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: (_, id) => {
      if (isDemo) {
        setDemoJobs((prev) => prev.filter((j) => j.id !== id));
        toast({ title: "Job deleted (demo)", description: "Demo mode — changes are not persisted." });
      } else {
        queryClient.invalidateQueries({ queryKey: ["myJobsList"] });
        toast({ title: "Job deleted", description: "The listing has been permanently removed." });
      }
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
      toast({ variant: "destructive", title: "Delete failed", description: "Could not delete the listing." });
    },
  });

  const handleToggle = (id: number, isActive: boolean) => {
    setTogglingId(id);
    toggleMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const filtered = allJobs.filter((job) => {
    const matchTab = tab === "all" || (tab === "active" ? job.isActive : !job.isActive);
    const matchSearch = !search || job.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const activeCount = allJobs.filter((j) => j.isActive).length;
  const closedCount = allJobs.filter((j) => !j.isActive).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Employer Tools</p>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>My Job Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} active · {closedCount} closed
            {isDemo && <span className="ml-2 text-xs font-semibold" style={{ color: TERRACOTTA }}>Demo mode</span>}
          </p>
        </div>
        <Link href="/jobs/new">
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all hover:opacity-90 shrink-0"
            style={{ backgroundColor: TERRACOTTA }}
          >
            <PlusCircle className="h-4 w-4" /> Post New Job
          </button>
        </Link>
      </div>

      {/* ── Demo banner ── */}
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: TERRACOTTA + "0d", borderColor: TERRACOTTA + "30" }}>
          <Sparkles className="h-4 w-4 shrink-0" style={{ color: TERRACOTTA }} />
          <p className="text-xs text-gray-700">
            <span className="font-semibold" style={{ color: TERRACOTTA }}>Demo mode — </span>
            edits, closures, and deletions are visible in this session but not saved. Create an account to manage real listings.
          </p>
        </div>
      )}

      {/* ── Search + Tabs ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm shrink-0">
          {[
            { key: "all", label: `All (${allJobs.length})` },
            { key: "active", label: `Active (${activeCount})` },
            { key: "closed", label: `Closed (${closedCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={tab === key
                ? { backgroundColor: TERRACOTTA, color: "white" }
                : { color: "#6b7280" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && !isDemo && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: TERRACOTTA }} />
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: TERRACOTTA + "15" }}>
            <Briefcase className="h-7 w-7" style={{ color: TERRACOTTA }} />
          </div>
          <p className="text-lg font-bold text-gray-400 mb-1">
            {search ? `No results for "${search}"` : tab === "active" ? "No active listings" : tab === "closed" ? "No closed listings" : "No jobs posted yet"}
          </p>
          <p className="text-sm text-gray-300 mb-5">
            {search ? "Try a different search term" : "Post your first role to start finding great talent"}
          </p>
          {!search && (
            <Link href="/jobs/new">
              <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ backgroundColor: TERRACOTTA }}>
                Post a Job
              </button>
            </Link>
          )}
        </div>
      )}

      {/* ── Job cards ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isDemo={isDemo}
              onToggleActive={handleToggle}
              onDelete={handleDelete}
              togglingId={togglingId}
              deletingId={deletingId}
            />
          ))}
          <p className="text-xs text-gray-400 text-center pt-2">
            Showing {filtered.length} of {allJobs.length} listing{allJobs.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
