import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { isDemoEmail } from "@/lib/demoAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users, ChevronRight, ChevronLeft, Clock, Briefcase,
  Sparkles, Filter, X, Check, Loader2, AlertCircle, MessageSquare,
  Eye, EyeOff, Send, ExternalLink, CalendarCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getInterviewByName } from "@/lib/interviewStore";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const AMBER = "#F97316";
const PURPLE = "#8b5cf6";

const PIPELINE_STAGES = [
  { key: "pending",     label: "Applied",     color: INK,    bg: "#e8ecf2" },
  { key: "reviewed",    label: "Reviewed",    color: AMBER,   bg: "#fff3e6" },
  { key: "shortlisted", label: "Shortlisted", color: PURPLE,  bg: "#f3effd" },
  { key: "interview",   label: "Interview",   color: "#0ea5e9", bg: "#e6f5fb" },
  { key: "offer",       label: "Offer Made",  color: "#10b981", bg: "#e6f8f3" },
  { key: "hired",       label: "Hired",       color: TERRACOTTA,   bg: "#FDF0EB" },
] as const;

type StageKey = (typeof PIPELINE_STAGES)[number]["key"];

interface PipelineCandidate {
  id: number;
  name: string;
  initials: string;
  jobTitle: string;
  appliedFor: string;
  status: StageKey;
  appliedAt: string;
  location?: string;
}

const DEMO_PIPELINE_KEY = "bridgepath_demo_pipeline";

const DEMO_CANDIDATES: PipelineCandidate[] = [
  { id: 1001, name: "Amina Mensah",    initials: "AM", jobTitle: "Senior Software Engineer", appliedFor: "Senior Software Engineer", status: "pending",     appliedAt: new Date(Date.now() - 2 * 3600000).toISOString(),   location: "Nairobi, KE" },
  { id: 1002, name: "Samuel Njoroge",  initials: "SN", jobTitle: "Data Analyst",              appliedFor: "Data Analyst",             status: "pending",     appliedAt: new Date(Date.now() - 5 * 3600000).toISOString(),   location: "Nairobi, KE" },
  { id: 1003, name: "Rosa Achebe",     initials: "RA", jobTitle: "HR Business Partner",       appliedFor: "HR Business Partner",      status: "pending",     appliedAt: new Date(Date.now() - 9 * 3600000).toISOString(),   location: "Lagos, NG" },
  { id: 1004, name: "Kwame Owusu",     initials: "KO", jobTitle: "Product Manager",           appliedFor: "Product Manager",          status: "reviewed",    appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),  location: "Accra, GH" },
  { id: 1005, name: "Fatima Hassan",   initials: "FH", jobTitle: "Senior Software Engineer",  appliedFor: "Senior Software Engineer", status: "reviewed",    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),  location: "Remote" },
  { id: 1006, name: "Peter Rono",      initials: "PR", jobTitle: "Product Manager",           appliedFor: "Product Manager",          status: "shortlisted", appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),  location: "Accra, GH" },
  { id: 1007, name: "Grace Abiodun",   initials: "GA", jobTitle: "HR Business Partner",       appliedFor: "HR Business Partner",      status: "shortlisted", appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),  location: "Lagos, NG" },
  { id: 1008, name: "Lydia Osei",      initials: "LO", jobTitle: "HR Operations Lead",        appliedFor: "HR Business Partner",      status: "interview",   appliedAt: new Date(Date.now() - 6 * 86400000).toISOString(),  location: "Remote" },
  { id: 1009, name: "Daniel Asante",   initials: "DA", jobTitle: "Senior Software Engineer",  appliedFor: "Senior Software Engineer", status: "offer",       appliedAt: new Date(Date.now() - 10 * 86400000).toISOString(), location: "Accra, GH" },
  { id: 1010, name: "Nadia Kamara",    initials: "NK", jobTitle: "Data Analyst",              appliedFor: "Data Analyst",             status: "pending",     appliedAt: new Date(Date.now() - 12 * 3600000).toISOString(),  location: "Conakry, GN" },
];

function loadDemoPipeline(): PipelineCandidate[] {
  try {
    const raw = localStorage.getItem(DEMO_PIPELINE_KEY);
    if (raw) return JSON.parse(raw) as PipelineCandidate[];
  } catch {}
  return DEMO_CANDIDATES;
}

function saveDemoPipeline(candidates: PipelineCandidate[]) {
  localStorage.setItem(DEMO_PIPELINE_KEY, JSON.stringify(candidates));
}

function getStageIndex(key: StageKey): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === key);
}

interface FeedbackModalProps {
  candidate: PipelineCandidate;
  onClose: () => void;
  onSubmit: (content: string, isAnonymous: boolean) => void;
  submitting: boolean;
}

function FeedbackModal({ candidate, onClose, onSubmit, submitting }: FeedbackModalProps) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900">Leave Growth Feedback</h3>
            <p className="text-xs text-gray-500 mt-0.5">For <span className="font-semibold">{candidate.name}</span> · {candidate.appliedFor}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Your feedback</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share constructive insights — what went well, what could improve, skills to develop..."
            rows={5}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-3 resize-none outline-none focus:ring-2 focus:border-transparent transition-all leading-relaxed"
            style={{ focusRingColor: "#C04020" } as any}
            onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${TERRACOTTA}40`}
            onBlur={e => e.target.style.boxShadow = "none"}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">{content.length}/500 characters</p>
        </div>

        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl border mb-4 transition-all"
          style={isAnonymous
            ? { borderColor: INK, backgroundColor: INK + "08" }
            : { borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
        >
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: isAnonymous ? INK + "15" : "#f3f4f6" }}
          >
            {isAnonymous
              ? <EyeOff className="h-4 w-4" style={{ color: INK }} />
              : <Eye className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {isAnonymous ? "Anonymous feedback" : "Send as yourself"}
            </p>
            <p className="text-xs text-gray-500">
              {isAnonymous ? "Candidate won't see your name or company" : "Candidate will see your name and company"}
            </p>
          </div>
          <div
            className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
            style={isAnonymous ? { borderColor: INK, backgroundColor: INK } : { borderColor: "#d1d5db" }}
          >
            {isAnonymous && <Check className="h-3 w-3 text-white" />}
          </div>
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!content.trim() || submitting}
            onClick={() => onSubmit(content, isAnonymous)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: TERRACOTTA }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending..." : "Send Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

const GREEN = "#10b981";

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

function CandidateCard({
  candidate,
  onMove,
  onFeedback,
  moving,
  totalStages,
}: {
  candidate: PipelineCandidate;
  onMove: (id: number, newStage: StageKey) => void;
  onFeedback: (candidate: PipelineCandidate) => void;
  moving: boolean;
  totalStages: number;
}) {
  const stageIdx = getStageIndex(candidate.status);
  const canGoBack = stageIdx > 0;
  const canGoForward = stageIdx < totalStages - 1;
  const prevStage = canGoBack ? PIPELINE_STAGES[stageIdx - 1] : null;
  const nextStage = canGoForward ? PIPELINE_STAGES[stageIdx + 1] : null;

  const interview = getInterviewByName(candidate.name);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: INK }}
        >
          {candidate.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{candidate.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{candidate.jobTitle}</p>
          {candidate.location && (
            <p className="text-[11px] text-gray-400 mt-0.5">{candidate.location}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-gray-50">
        <Briefcase className="h-3 w-3 text-gray-400 shrink-0" />
        <span className="text-[11px] text-gray-600 truncate">{candidate.appliedFor}</span>
      </div>

      {/* Interview badge */}
      {interview && (
        <div
          className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg"
          style={{ backgroundColor: GREEN + "12" }}
        >
          <CalendarCheck className="h-3 w-3 shrink-0" style={{ color: GREEN }} />
          <span className="text-[11px] font-semibold truncate" style={{ color: GREEN }}>
            Interview · {formatShortDate(interview.date)} at {interview.time}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onFeedback(candidate)}
            title="Leave growth feedback"
            className="h-6 w-6 rounded-md flex items-center justify-center text-gray-300 hover:text-purple-500 hover:bg-purple-50 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          {canGoBack && (
            <button
              disabled={moving}
              onClick={() => onMove(candidate.id, prevStage!.key)}
              title={`Move to ${prevStage!.label}`}
              className="h-6 w-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              {moving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          )}
          {canGoForward && (
            <button
              disabled={moving}
              onClick={() => onMove(candidate.id, nextStage!.key)}
              title={`Move to ${nextStage!.label}`}
              className="h-6 w-6 rounded-md flex items-center justify-center text-white transition-colors disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: nextStage!.color }}
            >
              {moving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
          {!canGoForward && candidate.status === "hired" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: TERRACOTTA + "20", color: TERRACOTTA }}>
              <Check className="h-3 w-3" /> Hired
            </span>
          )}
        </div>
      </div>

      <Link href="/candidates">
        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
          <ExternalLink className="h-3 w-3" />
          View Profile
        </div>
      </Link>
    </div>
  );
}

export default function PipelinePage() {
  const { user } = useAuth();
  const isDemo = isDemoEmail(user?.email);
  const queryClient = useQueryClient();
  const [movingId, setMovingId] = useState<number | null>(null);
  const [filterJob, setFilterJob] = useState<string>("all");
  const [feedbackTarget, setFeedbackTarget] = useState<PipelineCandidate | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [demoCandidates, setDemoCandidates] = useState<PipelineCandidate[]>(() => loadDemoPipeline());

  const { data: realApps, isLoading: realLoading, isError } = useQuery({
    queryKey: ["employer-pipeline"],
    queryFn: async () => {
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch("/api/applications/employer-all", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json() as Promise<any[]>;
    },
    enabled: !isDemo,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch(`/api/applications/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-pipeline"] });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ applicationId, content, isAnonymous }: { applicationId: number; content: string; isAnonymous: boolean }) => {
      const token = localStorage.getItem("bridgepath_token");
      const res = await fetch(`/api/applications/${applicationId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, isAnonymous }),
      });
      if (!res.ok) throw new Error("Failed to send feedback");
      return res.json();
    },
    onSuccess: (_, vars) => {
      setFeedbackTarget(null);
      setFeedbackSuccess(`Feedback sent to ${feedbackTarget?.name ?? "candidate"}`);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    },
  });

  const handleMove = (id: number, newStage: StageKey) => {
    if (isDemo) {
      const updated = demoCandidates.map((c) =>
        c.id === id ? { ...c, status: newStage } : c
      );
      setDemoCandidates(updated);
      saveDemoPipeline(updated);
      return;
    }
    setMovingId(id);
    mutation.mutate({ id, status: newStage }, {
      onSettled: () => setMovingId(null),
    });
  };

  const handleFeedbackSubmit = (content: string, isAnonymous: boolean) => {
    if (!feedbackTarget) return;
    if (isDemo) {
      setFeedbackTarget(null);
      setFeedbackSuccess(`Feedback sent to ${feedbackTarget.name} (demo — not saved)`);
      setTimeout(() => setFeedbackSuccess(null), 4000);
      return;
    }
    feedbackMutation.mutate({ applicationId: feedbackTarget.id, content, isAnonymous });
  };

  const candidates: PipelineCandidate[] = isDemo
    ? demoCandidates
    : (realApps ?? []).map((app: any) => ({
        id: app.id,
        name: app.applicant?.name ?? "Unknown",
        initials: (app.applicant?.name ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        jobTitle: app.applicantProfile?.headline ?? app.applicant?.name ?? "Candidate",
        appliedFor: app.job?.title ?? "Unknown role",
        status: (PIPELINE_STAGES.some((s) => s.key === app.status) ? app.status : "pending") as StageKey,
        appliedAt: app.createdAt,
        location: app.applicantProfile?.location ?? undefined,
      }));

  const allJobs = Array.from(new Set(candidates.map((c) => c.appliedFor)));
  const filtered = filterJob === "all" ? candidates : candidates.filter((c) => c.appliedFor === filterJob);

  const byStage = (key: StageKey) => filtered.filter((c) => c.status === key);

  if (!isDemo && realLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: TERRACOTTA }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* Feedback modal */}
      {feedbackTarget && (
        <FeedbackModal
          candidate={feedbackTarget}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={handleFeedbackSubmit}
          submitting={feedbackMutation.isPending}
        />
      )}

      {/* Success toast */}
      {feedbackSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl" style={{ backgroundColor: "#10b981" }}>
          <Check className="h-4 w-4" /> {feedbackSuccess}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Employer Tools</p>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>Candidate Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} candidate{filtered.length !== 1 ? "s" : ""} across {PIPELINE_STAGES.length} stages</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg" style={{ backgroundColor: TERRACOTTA + "18", color: TERRACOTTA }}>
              <Sparkles className="h-3.5 w-3.5" /> Demo data
            </span>
          )}
          {allJobs.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">All Jobs</option>
                {allJobs.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load applications. Make sure the backend is running.
        </div>
      )}

      {/* Empty state */}
      {!isDemo && !realLoading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-400">No applications yet</p>
          <p className="text-sm text-gray-300 mt-1">Applications to your jobs will appear here once candidates apply.</p>
        </div>
      )}

      {/* Kanban board */}
      {(isDemo || candidates.length > 0) && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const cards = byStage(stage.key);
              return (
                <div
                  key={stage.key}
                  className="w-64 shrink-0 flex flex-col rounded-2xl overflow-hidden"
                  style={{ backgroundColor: stage.bg }}
                >
                  {/* Column header */}
                  <div className="px-3.5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-xs font-bold text-gray-700">{stage.label}</span>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: stage.color + "20", color: stage.color }}
                    >
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 px-2 pb-3 space-y-2 min-h-[120px]">
                    {cards.length === 0 && (
                      <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-xs text-gray-300 font-medium">Empty</p>
                      </div>
                    )}
                    {cards.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onMove={handleMove}
                        onFeedback={setFeedbackTarget}
                        moving={movingId === candidate.id}
                        totalStages={PIPELINE_STAGES.length}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-xs text-gray-500">{stage.label}</span>
            {i < PIPELINE_STAGES.length - 1 && (
              <ChevronRight className="h-3 w-3 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
