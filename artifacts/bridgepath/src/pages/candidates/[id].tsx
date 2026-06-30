import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft, Briefcase, MapPin, MessageSquare, KanbanSquare,
  GraduationCap, Award, Globe, Clock, DollarSign,
  Linkedin, Github, Download, CheckCircle2,
  CalendarPlus, CalendarCheck, X, Check, Star, Video, Phone, Users,
} from "lucide-react";
import {
  scheduleInterview,
  getInterview,
  cancelInterview,
  type ScheduledInterview,
} from "@/lib/interviewStore";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const TEAL = "#1F7A78";
const GREEN = "#10b981";

const dicebear = (seed: string) =>
  `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;

const CANDIDATES = [
  {
    id: "1",
    name: "Amina Mensah",
    avatar: dicebear("amina-mensah"),
    role: "Senior Software Engineer",
    headline: "Full-stack engineer building scalable fintech products for African markets",
    location: "Accra, Ghana",
    experience: "6 years",
    availability: "Available in 2 weeks",
    salaryExpectation: "USD 70,000 – 90,000 / yr",
    score: 92,
    linkedin: "#",
    github: "#",
    languages: ["English (Fluent)", "Twi (Native)", "Swahili (Conversational)"],
    skills: [
      { name: "React", level: 95 },
      { name: "Node.js", level: 92 },
      { name: "TypeScript", level: 90 },
      { name: "AWS", level: 85 },
      { name: "PostgreSQL", level: 82 },
      { name: "Docker", level: 78 },
      { name: "Fintech APIs", level: 88 },
      { name: "GraphQL", level: 74 },
    ],
    summary: "Full-stack engineer with 6 years of experience designing and shipping production-grade systems for fintech, payments, and marketplace platforms across Sub-Saharan Africa. Strong background in cloud-native architecture, distributed systems, and developer tooling. Equally comfortable owning product infrastructure and mentoring junior engineers.",
    experience_history: [
      {
        title: "Senior Software Engineer",
        company: "Flutterwave",
        location: "Accra, GH (Remote)",
        period: "2021 – Present",
        bullets: [
          "Architected high-throughput payment processing API serving 3M+ transactions/month",
          "Led migration from monolith to microservices, reducing deployment time by 70%",
          "Mentored 4 junior engineers and ran bi-weekly technical knowledge-share sessions",
        ],
      },
      {
        title: "Frontend Engineer",
        company: "Andela",
        location: "Accra, GH",
        period: "2019 – 2021",
        bullets: [
          "Built React dashboard for enterprise clients including GitHub and Coursera",
          "Improved Lighthouse performance scores from 58 → 94 across core product flows",
          "Developed internal component library adopted across 6 engineering teams",
        ],
      },
      {
        title: "Junior Developer",
        company: "TechBridge GH",
        location: "Accra, GH",
        period: "2018 – 2019",
        bullets: [
          "Built customer-facing web applications using React and Django",
          "Integrated M-Pesa and MTN Mobile Money payment SDKs",
        ],
      },
    ],
    education: [
      { degree: "BSc Computer Science", institution: "University of Ghana, Legon", year: "2018", honours: "First Class Honours" },
    ],
    certifications: [
      "AWS Certified Solutions Architect – Associate",
      "Google Cloud Professional Developer",
    ],
  },
  {
    id: "2",
    name: "Peter Rono",
    avatar: dicebear("peter-rono"),
    role: "Product Manager",
    headline: "Product leader with a track record of shipping growth products in African B2B markets",
    location: "Accra, Ghana",
    experience: "4 years",
    availability: "Immediately available",
    salaryExpectation: "USD 55,000 – 75,000 / yr",
    score: 88,
    linkedin: "#",
    github: null,
    languages: ["English (Fluent)", "Ga (Native)", "French (Basic)"],
    skills: [
      { name: "Roadmapping", level: 92 },
      { name: "Agile / Scrum", level: 90 },
      { name: "Analytics", level: 85 },
      { name: "Customer Research", level: 88 },
      { name: "SQL", level: 74 },
      { name: "Figma", level: 70 },
      { name: "SaaS", level: 86 },
      { name: "OKRs", level: 82 },
    ],
    summary: "Product Manager with 4 years of experience leading cross-functional teams to build and grow B2B SaaS platforms in African markets. Experienced in customer discovery, data-driven prioritisation, and iterative delivery. Proven ability to align engineering, design, and business stakeholders.",
    experience_history: [
      {
        title: "Product Manager",
        company: "Paystack",
        location: "Accra, GH",
        period: "2022 – Present",
        bullets: [
          "Owned the merchant dashboard product, growing MAU by 42% in 12 months",
          "Ran 60+ customer discovery interviews shaping Q3–Q4 roadmap",
          "Collaborated with engineering to ship API developer portal cutting integration time by 3×",
        ],
      },
      {
        title: "Associate Product Manager",
        company: "Jumia",
        location: "Lagos, NG (Remote)",
        period: "2021 – 2022",
        bullets: [
          "Managed search and discovery product for marketplace with 3M+ SKUs",
          "Defined and tracked KPIs leading to 18% lift in conversion",
        ],
      },
    ],
    education: [
      { degree: "MBA", institution: "GIMPA Business School", year: "2021", honours: "Distinction" },
      { degree: "BSc Economics", institution: "University of Cape Coast", year: "2019", honours: "" },
    ],
    certifications: [
      "Certified Scrum Product Owner (CSPO)",
      "Product School – Product Analytics",
    ],
  },
  {
    id: "3",
    name: "Lydia Osei",
    avatar: dicebear("lydia-osei"),
    role: "HR Operations Lead",
    headline: "People operations specialist scaling distributed HR systems for high-growth companies",
    location: "Remote",
    experience: "5 years",
    availability: "Available in 1 month",
    salaryExpectation: "USD 45,000 – 65,000 / yr",
    score: 85,
    linkedin: "#",
    github: null,
    languages: ["English (Fluent)", "Twi (Native)", "French (Intermediate)"],
    skills: [
      { name: "HRIS", level: 94 },
      { name: "People Ops", level: 92 },
      { name: "Compliance", level: 88 },
      { name: "Payroll", level: 86 },
      { name: "Onboarding", level: 90 },
      { name: "BambooHR", level: 84 },
      { name: "Workday", level: 78 },
      { name: "Employment Law (Africa)", level: 80 },
    ],
    summary: "HR Operations Lead with 5 years of experience helping distributed and hybrid companies build compliant, people-first operations across Africa and remote markets. Skilled in designing onboarding frameworks, HRIS implementation, payroll compliance, and building HR from the ground up.",
    experience_history: [
      {
        title: "HR Operations Lead",
        company: "Andela",
        location: "Remote (Pan-Africa)",
        period: "2021 – Present",
        bullets: [
          "Manages HR operations for 200+ distributed engineers across 12 African countries",
          "Implemented BambooHR across 3 business units, reducing manual HR admin by 60%",
          "Designed onboarding and offboarding playbooks adopted company-wide",
        ],
      },
      {
        title: "HR Generalist",
        company: "Stanbic Bank Ghana",
        location: "Accra, GH",
        period: "2019 – 2021",
        bullets: [
          "Managed employment contracts, benefits, and payroll for 180-person branch",
          "Led compliance review ensuring alignment with Ghana Labour Act amendments",
        ],
      },
    ],
    education: [
      { degree: "BA Human Resource Management", institution: "University of Ghana", year: "2019", honours: "Second Class Upper" },
    ],
    certifications: [
      "SHRM-CP Certified",
      "CIPD Level 5 – People Management",
    ],
  },
  {
    id: "4",
    name: "Samuel Amoah",
    avatar: dicebear("samuel-amoah"),
    role: "Data Analyst",
    headline: "Turning messy operational data into clear business decisions for growing African companies",
    location: "Accra, Ghana",
    experience: "3 years",
    availability: "Available in 3 weeks",
    salaryExpectation: "USD 35,000 – 55,000 / yr",
    score: 81,
    linkedin: "#",
    github: "#",
    languages: ["English (Fluent)", "Twi (Native)", "Ga (Conversational)"],
    skills: [
      { name: "SQL", level: 94 },
      { name: "Python", level: 88 },
      { name: "Tableau", level: 86 },
      { name: "Power BI", level: 82 },
      { name: "dbt", level: 74 },
      { name: "BigQuery", level: 78 },
      { name: "Excel / Sheets", level: 92 },
      { name: "Data Storytelling", level: 86 },
    ],
    summary: "Data Analyst with 3 years of experience helping operations, finance, and product teams make faster, better-evidenced decisions. Specialises in building self-service dashboards, automating reports, and improving data quality at growing companies across East Africa.",
    experience_history: [
      {
        title: "Data Analyst",
        company: "Safaricom",
        location: "Nairobi, KE",
        period: "2022 – Present",
        bullets: [
          "Built 12 executive dashboards in Tableau used weekly by VP-level stakeholders",
          "Automated daily KPI reporting saving 8+ hours/week across the analytics team",
          "Led data quality initiative reducing reporting errors by 35%",
        ],
      },
      {
        title: "Junior Data Analyst",
        company: "Twiga Foods",
        location: "Nairobi, KE",
        period: "2021 – 2022",
        bullets: [
          "Analysed delivery route efficiency, surfacing optimisations saving KES 400K/month",
          "Built farmer supply dashboards used by operations managers in 3 counties",
        ],
      },
    ],
    education: [
      { degree: "BSc Statistics", institution: "University of Nairobi", year: "2021", honours: "First Class" },
    ],
    certifications: [
      "Google Data Analytics Certificate",
      "Microsoft Power BI Data Analyst (PL-300)",
    ],
  },
];

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM",
];

const INTERVIEW_TYPES = [
  { value: "video",      label: "Video Call",  Icon: Video,  color: "#0ea5e9" },
  { value: "phone",      label: "Phone Call",  Icon: Phone,  color: TEAL },
  { value: "in-person",  label: "In-Person",   Icon: Users,  color: TERRACOTTA },
] as const;

function ScheduleModal({
  candidate,
  existing,
  onClose,
  onSave,
  onCancel,
}: {
  candidate: { id: string; name: string };
  existing: ScheduledInterview | null;
  onClose: () => void;
  onSave: (data: Omit<ScheduledInterview, "scheduledAt">) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(existing?.date ?? "");
  const [time, setTime] = useState(existing?.time ?? "10:00 AM");
  const [type, setType] = useState<"video" | "phone" | "in-person">(existing?.type ?? "video");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [showCancel, setShowCancel] = useState(false);

  const valid = date.trim() !== "" && time !== "";

  function handleSave() {
    if (!valid) return;
    onSave({ candidateId: candidate.id, candidateName: candidate.name, date, time, type, notes });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">{existing ? "Edit Interview" : "Schedule Interview"}</h3>
            <p className="text-xs text-gray-500 mt-0.5">with <span className="font-semibold">{candidate.name}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Interview type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2.5">Interview format</label>
            <div className="flex gap-2">
              {INTERVIEW_TYPES.map(({ value, label, Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-semibold"
                  style={type === value
                    ? { borderColor: color, backgroundColor: color + "10", color }
                    : { borderColor: "#e5e7eb", color: "#6b7280" }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 transition-all"
              onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${TERRACOTTA}40`)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2.5">Time slot</label>
            <div className="grid grid-cols-5 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className="py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                  style={time === slot
                    ? { borderColor: TERRACOTTA, backgroundColor: TERRACOTTA, color: "#fff" }
                    : { borderColor: "#e5e7eb", color: "#6b7280" }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Technical round — bring system design questions"
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-3 resize-none outline-none transition-all leading-relaxed"
              onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${TERRACOTTA}40`)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <div className="flex gap-2">
            {existing && !showCancel && (
              <button
                onClick={() => setShowCancel(true)}
                className="px-4 py-2.5 text-sm font-semibold text-red-500 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
              >
                Cancel interview
              </button>
            )}
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Close
            </button>
            <button
              disabled={!valid}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: TERRACOTTA }}
            >
              <CalendarCheck className="h-4 w-4" />
              {existing ? "Update" : "Confirm"}
            </button>
          </div>
          {showCancel && (
            <div className="flex gap-2 p-3.5 bg-red-50 rounded-xl border border-red-100">
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-700">Remove this interview booking?</p>
                <p className="text-[11px] text-red-400 mt-0.5">This cannot be undone.</p>
              </div>
              <button onClick={() => setShowCancel(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">Keep</button>
              <button onClick={onCancel} className="text-xs font-bold text-red-600 hover:text-red-800 px-2">Remove</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={TERRACOTTA} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="text-center">
        <div className="text-xl font-bold leading-none" style={{ color: TERRACOTTA }}>{score}</div>
        <div className="text-[9px] font-semibold text-gray-400 mt-0.5">match</div>
      </div>
    </div>
  );
}

function formatInterviewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function CandidateProfilePage() {
  const [, params] = useRoute("/candidates/:id");
  const candidate = CANDIDATES.find((c) => c.id === params?.id) ?? CANDIDATES[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [interview, setInterview] = useState<ScheduledInterview | null>(null);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);

  useEffect(() => {
    setInterview(getInterview(candidate.id));
  }, [candidate.id]);

  function showToast(msg: string, color = GREEN) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 4000);
  }

  function handleSave(data: Omit<ScheduledInterview, "scheduledAt">) {
    const full: ScheduledInterview = { ...data, scheduledAt: new Date().toISOString() };
    scheduleInterview(full);
    setInterview(full);
    setModalOpen(false);
    showToast(`Interview scheduled for ${formatInterviewDate(data.date)} at ${data.time}`);
  }

  function handleCancel() {
    cancelInterview(candidate.id);
    setInterview(null);
    setModalOpen(false);
    showToast("Interview removed", "#6b7280");
  }

  const typeInfo = INTERVIEW_TYPES.find((t) => t.value === interview?.type) ?? INTERVIEW_TYPES[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-8">

      {/* Modal */}
      {modalOpen && (
        <ScheduleModal
          candidate={{ id: candidate.id, name: candidate.name }}
          existing={interview}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl whitespace-nowrap"
          style={{ backgroundColor: toast.color }}
        >
          <Check className="h-4 w-4" /> {toast.msg}
        </div>
      )}

      {/* Back */}
      <Link href="/candidates">
        <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to candidates
        </button>
      </Link>

      {/* Scheduled interview banner */}
      {interview && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
          style={{ backgroundColor: GREEN + "0d", borderColor: GREEN + "30" }}
        >
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN + "20" }}>
            <CalendarCheck className="h-4 w-4" style={{ color: GREEN }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: GREEN }}>Interview scheduled</p>
            <p className="text-xs text-gray-600 mt-0.5">
              <typeInfo.Icon className="inline h-3 w-3 mr-1" />
              {typeInfo.label} · {formatInterviewDate(interview.date)} at {interview.time}
              {interview.notes && <span className="text-gray-400"> · {interview.notes}</span>}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white shrink-0"
            style={{ borderColor: GREEN + "40", color: GREEN }}
          >
            Edit
          </button>
        </div>
      )}

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-16 w-full" style={{ background: `linear-gradient(135deg, ${INK} 0%, #3d2b1e 100%)` }} />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-8 mb-5">
            <div className="flex items-end gap-4">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-md shrink-0"
              />
              <div className="pb-1">
                <h1 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: INK }}>{candidate.name}</h1>
                <p className="text-sm font-semibold mt-0.5" style={{ color: TERRACOTTA }}>{candidate.role}</p>
                <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{candidate.headline}</p>
              </div>
            </div>
            <ScoreRing score={candidate.score} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 mb-6">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {candidate.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {candidate.experience} experience</span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: TEAL }}>
              <Clock className="h-3.5 w-3.5" /> {candidate.availability}
            </span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: TERRACOTTA }}>
              <DollarSign className="h-3.5 w-3.5" /> {candidate.salaryExpectation}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Link href="/messages">
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                style={{ backgroundColor: TERRACOTTA }}
              >
                <MessageSquare className="h-4 w-4" /> Message Candidate
              </button>
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:opacity-90"
              style={interview
                ? { backgroundColor: GREEN, color: "#fff" }
                : { backgroundColor: INK, color: "#fff" }}
            >
              {interview
                ? <><CalendarCheck className="h-4 w-4" /> Interview Booked</>
                : <><CalendarPlus className="h-4 w-4" /> Schedule Interview</>}
            </button>
            <Link href="/dashboard/pipeline">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-700">
                <KanbanSquare className="h-4 w-4" /> Pipeline
              </button>
            </Link>
            {candidate.linkedin && (
              <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-600">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </button>
              </a>
            )}
            {candidate.github && (
              <a href={candidate.github} target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-600">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </button>
              </a>
            )}
            <button className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 transition text-gray-600">
              <Download className="h-3.5 w-3.5" /> CV Summary
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Summary + Experience + Education */}
        <div className="lg:col-span-2 space-y-5">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" style={{ color: TERRACOTTA }} /> Professional Summary
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{candidate.summary}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Briefcase className="h-4 w-4" style={{ color: TERRACOTTA }} /> Work Experience
            </h2>
            <div className="space-y-6">
              {candidate.experience_history.map((exp, i) => (
                <div key={i} className="relative pl-5">
                  <div
                    className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: i === 0 ? TERRACOTTA : "#d1d5db" }}
                  />
                  {i < candidate.experience_history.length - 1 && (
                    <div className="absolute left-[4.5px] top-4 bottom-[-20px] w-px bg-gray-100" />
                  )}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{exp.title}</h3>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: TERRACOTTA }}>{exp.company}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {exp.location}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap shrink-0 bg-gray-50 px-2.5 py-1 rounded-lg">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="mt-2.5 space-y-1.5">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: TERRACOTTA + "90" }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" style={{ color: TERRACOTTA }} /> Education
            </h2>
            <div className="space-y-4">
              {candidate.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA + "12" }}>
                    <GraduationCap className="h-4 w-4" style={{ color: TERRACOTTA }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{edu.degree}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{edu.institution} · {edu.year}</p>
                    {edu.honours && (
                      <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: TEAL + "15", color: TEAL }}>
                        {edu.honours}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Interview status card */}
          <div
            className="rounded-2xl p-5 border"
            style={interview
              ? { backgroundColor: GREEN + "08", borderColor: GREEN + "25" }
              : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: interview ? GREEN + "20" : "#e5e7eb" }}
              >
                {interview
                  ? <CalendarCheck className="h-4.5 w-4.5" style={{ color: GREEN }} />
                  : <CalendarPlus className="h-4 w-4 text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {interview ? "Interview Booked" : "No interview yet"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {interview
                    ? `${formatInterviewDate(interview.date)}`
                    : "Schedule a time with this candidate"}
                </p>
              </div>
            </div>
            {interview && (
              <div className="space-y-1.5 mb-3 pl-1">
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <typeInfo.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: typeInfo.color }} />
                  {typeInfo.label} at {interview.time}
                </p>
                {interview.notes && (
                  <p className="text-xs text-gray-400 italic">{interview.notes}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={interview
                ? { backgroundColor: GREEN, color: "#fff" }
                : { backgroundColor: TERRACOTTA, color: "#fff" }}
            >
              {interview ? "Edit booking" : "Schedule Interview"}
            </button>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: TERRACOTTA }} /> Skills
            </h2>
            <div className="space-y-3">
              {candidate.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{skill.name}</span>
                    <span className="text-[11px] font-bold" style={{ color: TERRACOTTA }}>{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${skill.level}%`, backgroundColor: skill.level >= 90 ? TERRACOTTA : skill.level >= 80 ? "#f97316" : "#a3a3a3" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" style={{ color: "#8b5cf6" }} /> Certifications
            </h2>
            <div className="space-y-2.5">
              {candidate.certifications.map((cert, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#8b5cf620" }}>
                    <CheckCircle2 className="h-3 w-3" style={{ color: "#8b5cf6" }} />
                  </div>
                  <p className="text-xs text-gray-700 leading-snug">{cert}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" style={{ color: TEAL }} /> Languages
            </h2>
            <div className="space-y-2">
              {candidate.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: i === 0 ? TERRACOTTA : TEAL }} />
                  <span className="text-xs text-gray-700">{lang}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
