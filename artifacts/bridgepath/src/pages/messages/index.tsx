import { useState } from "react";
import { Link } from "wouter";
import { Send, Search, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";

type Msg = { from: "employer" | "candidate"; text: string; time: string };
type Convo = { id: number; name: string; role: string; time: string; messages: Msg[] };

const INITIAL: Convo[] = [
  {
    id: 1, name: "Amina Mensah", role: "Senior Software Engineer", time: "10:24",
    messages: [
      { from: "candidate", text: "Thank you for reaching out. I'm available for an intro call this week.", time: "10:24" },
      { from: "employer",  text: "Great. We're hiring for a senior engineering role supporting products across Africa. Could you share your availability?", time: "10:26" },
      { from: "candidate", text: "Tuesday or Thursday afternoon works well. I can also send a short portfolio summary before the call.", time: "10:30" },
    ],
  },
  {
    id: 2, name: "Peter Rono", role: "Product Manager", time: "Yesterday",
    messages: [
      { from: "employer",  text: "Hi Peter, we came across your profile and think you'd be a great fit for our product lead role.", time: "9:00" },
      { from: "candidate", text: "I can share more detail on recent product launches and market expansion work.", time: "9:15" },
    ],
  },
  {
    id: 3, name: "Lydia Osei", role: "HR Operations Lead", time: "Mon",
    messages: [
      { from: "candidate", text: "Happy to discuss how I have managed HR operations for remote teams.", time: "14:00" },
    ],
  },
];

export default function MessagesPage() {
  const { toast } = useToast();
  const [convos, setConvos] = useState<Convo[]>(INITIAL);
  const [activeId, setActiveId] = useState(INITIAL[0].id);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const active = convos.find((c) => c.id === activeId) ?? convos[0];

  const filtered = convos.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  function sendMsg() {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setConvos((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, time, messages: [...c.messages, { from: "employer", text, time }] }
          : c
      )
    );
    setDraft("");
    toast({ title: "Message sent" });
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: TERRACOTTA }}>Employer Messages</p>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: INK }}>Candidate Conversations</h1>
            <p className="text-sm text-gray-500 mt-1">{convos.length} active conversation{convos.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/candidates">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition shadow-sm" style={{ backgroundColor: TERRACOTTA }}>
              <User className="h-4 w-4" /> View Candidates
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: 580 }}>
          <div className="p-4 border-b border-gray-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition"
                style={{ "--tw-ring-color": `${TERRACOTTA}40` } as any}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0
              ? <div className="p-6 text-center text-sm text-gray-400">No conversations found</div>
              : filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="w-full text-left p-4 transition-colors"
                  style={{ backgroundColor: activeId === c.id ? "#fff5f0" : undefined }}
                  onMouseEnter={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLElement).style.backgroundColor = "#f9fafb"; }}
                  onMouseLeave={(e) => { if (activeId !== c.id) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: TERRACOTTA }}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.role}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{c.time}</span>
                  </div>
                  {c.messages.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 pl-[42px]">
                      {c.messages[c.messages.length - 1].text}
                    </p>
                  )}
                </button>
              ))
            }
          </div>
        </div>

        {/* Chat pane */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ minHeight: 520, maxHeight: 580 }}>
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: TERRACOTTA }}>
                {active.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{active.name}</p>
                <p className="text-xs text-gray-500">{active.role}</p>
              </div>
            </div>
            <Link href={`/candidates/${active.id}`}>
              <button className="text-xs font-semibold flex items-center gap-1.5 hover:underline transition" style={{ color: TERRACOTTA }}>
                View profile <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </button>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/60">
            {active.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "employer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.from === "employer"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm bg-white border border-gray-100 text-gray-700"
                  }`}
                  style={msg.from === "employer" ? { backgroundColor: INK } : {}}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] mt-1 opacity-50">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-3 shrink-0">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Write a message... (Enter to send)"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition"
              style={{ "--tw-ring-color": `${TERRACOTTA}40` } as any}
            />
            <button
              onClick={sendMsg}
              disabled={!draft.trim()}
              className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: TERRACOTTA }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
