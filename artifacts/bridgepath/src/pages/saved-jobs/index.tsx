import { useState } from "react";
import { Link } from "wouter";
import { useAuth, buildAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { isDemoEmail } from "@/lib/demoAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark, ArrowLeft, Search, MapPin, DollarSign,
  Briefcase, ExternalLink, X, ChevronRight, Clock
} from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { motion } from "framer-motion";
import { format } from "date-fns";

const CORAL = "#C04020";
const INK = "#1E1511";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function SavedJobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isDemo = isDemoEmail(user?.email);
  const { savedJobs, isLoading, toggleSave } = useSavedJobs(!isDemo && !!user);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);

  const filtered = savedJobs.filter((s: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const job = s.job;
    return (
      job?.title?.toLowerCase().includes(q) ||
      job?.employer?.name?.toLowerCase().includes(q) ||
      job?.location?.toLowerCase().includes(q)
    );
  });

  async function handleRemove(jobId: number) {
    setRemoving(jobId);
    await toggleSave(jobId);
    setRemoving(null);
    toast({ title: "Removed from saved jobs" });
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <PageSEO title="Saved Jobs | Bridgepath Africa" description="All the roles you have bookmarked. Review and apply directly from your saved jobs list." path="/saved-jobs" />

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
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: CORAL }}>Bookmarked Roles</p>
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: INK }}>Saved Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isDemo
                ? "Sign in to save real jobs and apply directly"
                : isLoading
                ? "Loading your saved jobs..."
                : savedJobs.length === 0
                ? "No saved jobs yet — browse roles and bookmark any that interest you"
                : `${savedJobs.length} role${savedJobs.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <Link href="/jobs">
            <button className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition shadow-sm" style={{ backgroundColor: CORAL }}>
              <Search className="h-4 w-4" /> Browse Jobs
            </button>
          </Link>
        </div>
      </div>

      {/* Search */}
      {!isDemo && savedJobs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved jobs by title, company, or location..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition"
              style={{ "--tw-ring-color": `${CORAL}40` } as any}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty / Demo state */}
      {(isDemo || (!isLoading && savedJobs.length === 0)) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: CORAL + "12" }}>
            <Bookmark className="h-7 w-7" style={{ color: CORAL }} />
          </div>
          <h2 className="text-base font-bold text-gray-800 mb-1">No saved jobs yet</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto mb-5">
            {isDemo
              ? "Create a free account to save jobs and track your applications."
              : "Click the bookmark icon on any job listing to save it here for later."}
          </p>
          {isDemo ? (
            <Link href="/auth/signup">
              <button className="px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition" style={{ backgroundColor: CORAL }}>
                Create Free Account
              </button>
            </Link>
          ) : (
            <Link href="/jobs">
              <button className="px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition" style={{ backgroundColor: CORAL }}>
                Explore Open Roles
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Jobs list */}
      {!isDemo && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((s: any, i: number) => {
              const job = s.job;
              if (!job) return null;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Employer avatar */}
                  <div className="h-11 w-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm shadow-sm" style={{ backgroundColor: CORAL }}>
                    {initials(job.employer?.name || "C")}
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${job.id}`}>
                      <p className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer group-hover:text-orange-700 transition-colors truncate">
                        {job.title}
                      </p>
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="text-sm font-medium text-gray-600">{job.employer?.name}</span>
                      {job.location && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
                      {job.salaryMin && job.salaryMax && (
                        <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: CORAL }}>
                          <DollarSign className="h-3 w-3" />
                          {(job.salaryMin / 1000).toFixed(0)}k–{(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                      )}
                      {job.type && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: CORAL + "15", color: CORAL }}>
                          {job.type}
                        </span>
                      )}
                    </div>
                    {s.savedAt && (
                      <p className="text-[11px] text-gray-300 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Saved {format(new Date(s.savedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRemove(job.id)}
                      disabled={removing === job.id}
                      title="Remove from saved"
                      className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {removing === job.id
                        ? <span className="h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                        : <X className="h-3.5 w-3.5" />
                      }
                    </button>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-lg hover:opacity-90 transition" style={{ backgroundColor: CORAL }}>
                        Apply <ChevronRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search no results */}
      {!isDemo && search && filtered.length === 0 && savedJobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No saved jobs match "{search}"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-xs font-semibold hover:underline" style={{ color: CORAL }}>
            Clear search
          </button>
        </div>
      )}

      {/* Footer link */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <Link href="/dashboard/jobseeker">
          <button className="flex items-center gap-1.5 font-semibold hover:text-gray-600 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </Link>
        <Link href="/jobs">
          <button className="flex items-center gap-1.5 font-semibold hover:text-gray-600 transition">
            Browse all open roles <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
