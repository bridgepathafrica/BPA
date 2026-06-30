import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Briefcase, MessageSquare, X, ChevronRight, Star } from "lucide-react";

const dicebear = (seed: string) => `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";

const ALL_CANDIDATES = [
  {
    id: 1,
    name: "Amina Mensah",
    role: "Senior Software Engineer",
    experience: "6 years",
    location: "Accra, Ghana",
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    summary: "Full-stack engineer with experience building scalable fintech products for African and global teams.",
    avatar: dicebear("amina-mensah"),
    score: 92,
    availability: "Available in 2 weeks",
  },
  {
    id: 2,
    name: "Peter Rono",
    role: "Product Manager",
    experience: "4 years",
    location: "Accra, Ghana",
    skills: ["Roadmapping", "Agile", "Analytics", "SaaS"],
    summary: "Product leader experienced in customer discovery, roadmap planning, and cross-functional delivery.",
    avatar: dicebear("peter-rono"),
    score: 88,
    availability: "Immediately available",
  },
  {
    id: 3,
    name: "Lydia Osei",
    role: "HR Operations Lead",
    experience: "5 years",
    location: "Remote",
    skills: ["HRIS", "People Ops", "Compliance", "Payroll"],
    summary: "People operations specialist helping distributed companies scale compliant HR systems.",
    avatar: dicebear("lydia-osei"),
    score: 85,
    availability: "Available in 1 month",
  },
  {
    id: 4,
    name: "Samuel Amoah",
    role: "Data Analyst",
    experience: "3 years",
    location: "Accra, Ghana",
    skills: ["SQL", "Python", "Tableau", "Power BI"],
    summary: "Analyst turning operational and customer data into clear hiring and business decisions.",
    avatar: dicebear("samuel-njoroge"),
    score: 81,
    availability: "Available in 3 weeks",
  },
];

export default function CandidatesPage() {
  const [search, setSearch] = useState("");

  const filtered = ALL_CANDIDATES.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: CORAL }}>Talent Pool</p>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: CHARCOAL }}>Browse Candidates</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Review diaspora and local professionals across Africa and remote roles.
            </p>
          </div>
          <Link href="/messages">
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition shadow-sm shrink-0"
              style={{ backgroundColor: CORAL }}
            >
              <MessageSquare className="h-4 w-4" /> View Messages
            </button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, skill, or location"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition"
            style={{ "--tw-ring-color": `${CORAL}40` } as any}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-2">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No candidates match "{search}"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-xs font-semibold hover:underline" style={{ color: CORAL }}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((candidate) => (
            <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
              <div className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer h-full flex flex-col">

                {/* Top: avatar + meta */}
                <div className="flex items-start gap-3">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {candidate.name}
                        </h2>
                        <p className="text-sm font-medium mt-0.5" style={{ color: CORAL }}>{candidate.role}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold" style={{ color: CORAL }}>{candidate.score}</div>
                        <div className="text-[10px] text-gray-400 -mt-0.5">match</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {candidate.experience}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {candidate.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-gray-500 mt-4 leading-relaxed flex-1">{candidate.summary}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: CORAL + "12", color: CORAL }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Availability */}
                <div className="mt-3 text-[11px] font-semibold" style={{ color: "#1F7A78" }}>
                  {candidate.availability}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <span className="text-xs font-semibold flex items-center gap-1 transition-colors group-hover:text-primary" style={{ color: CORAL }}>
                    View full profile <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="contents"
                  >
                    <Link href="/messages">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Message
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
