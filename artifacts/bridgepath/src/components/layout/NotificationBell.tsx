import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Bell, X, Check, CheckCheck,
  UserPlus, CalendarCheck, MessageSquare, Briefcase, Info,
} from "lucide-react";
import { getInterview } from "@/lib/interviewStore";

const TERRACOTTA = "#C04020";
const INK = "#1E1511";
const GREEN = "#10b981";
const BLUE = "#0ea5e9";
const PURPLE = "#8b5cf6";

const STORE_KEY = "bridgepath_notifications_read";

export type NotifType = "applicant" | "interview" | "message" | "job" | "info";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  time: string;
  timestamp: number;
}

function loadRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveRead(ids: Set<string>) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...ids]));
}

const TYPE_META: Record<NotifType, { Icon: React.ElementType; color: string; bg: string }> = {
  applicant: { Icon: UserPlus,       color: BLUE,       bg: BLUE + "12" },
  interview: { Icon: CalendarCheck,  color: GREEN,      bg: GREEN + "12" },
  message:   { Icon: MessageSquare,  color: TERRACOTTA, bg: TERRACOTTA + "12" },
  job:       { Icon: Briefcase,      color: PURPLE,     bg: PURPLE + "12" },
  info:      { Icon: Info,           color: "#6b7280",  bg: "#f3f4f6" },
};

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "today";
    if (d.toDateString() === tomorrow.toDateString()) return "tomorrow";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

function buildNotifications(): Notification[] {
  const now = Date.now();
  const notifs: Notification[] = [];

  const STATIC_APPLICANTS: Notification[] = [
    {
      id: "app-1001",
      type: "applicant",
      title: "New applicant",
      body: "Amina Mensah applied for Senior Software Engineer",
      href: "/dashboard/pipeline",
      time: "2h ago",
      timestamp: now - 2 * 3600000,
    },
    {
      id: "app-1002",
      type: "applicant",
      title: "New applicant",
      body: "Samuel Njoroge applied for Data Analyst",
      href: "/dashboard/pipeline",
      time: "5h ago",
      timestamp: now - 5 * 3600000,
    },
    {
      id: "app-1003",
      type: "applicant",
      title: "New applicant",
      body: "Rosa Achebe applied for HR Business Partner",
      href: "/dashboard/pipeline",
      time: "9h ago",
      timestamp: now - 9 * 3600000,
    },
    {
      id: "app-1004",
      type: "applicant",
      title: "New applicant",
      body: "Kwame Owusu applied for Product Manager",
      href: "/dashboard/pipeline",
      time: "1d ago",
      timestamp: now - 86400000,
    },
    {
      id: "app-1010",
      type: "applicant",
      title: "New applicant",
      body: "Nadia Kamara applied for Data Analyst",
      href: "/dashboard/pipeline",
      time: "12h ago",
      timestamp: now - 12 * 3600000,
    },
  ];

  const STATIC_MESSAGES: Notification[] = [
    {
      id: "msg-1",
      type: "message",
      title: "New message",
      body: "Amina Mensah: \u201cI\u2019m available for an intro call this week.\u201d",
      href: "/messages",
      time: "10:24",
      timestamp: now - 1.5 * 3600000,
    },
    {
      id: "msg-2",
      type: "message",
      title: "New message",
      body: "Lydia Osei: \u201cHappy to discuss how I have managed HR operations.\u201d",
      href: "/messages",
      time: "Mon",
      timestamp: now - 3 * 86400000,
    },
  ];

  const STATIC_JOBS: Notification[] = [
    {
      id: "job-1",
      type: "job",
      title: "Job gaining traction",
      body: "\u201cSenior Software Engineer\u201d has 3 new applicants this week",
      href: "/my-jobs",
      time: "2d ago",
      timestamp: now - 2 * 86400000,
    },
    {
      id: "job-2",
      type: "info",
      title: "Tip",
      body: "Complete your Company Profile to increase response rates by 40%",
      href: "/profile",
      time: "3d ago",
      timestamp: now - 3 * 86400000,
    },
  ];

  notifs.push(...STATIC_APPLICANTS, ...STATIC_MESSAGES, ...STATIC_JOBS);

  const INTERVIEW_CANDIDATE_IDS = ["1", "2", "3", "4"];
  const CANDIDATE_NAMES: Record<string, string> = {
    "1": "Amina Mensah",
    "2": "Peter Rono",
    "3": "Lydia Osei",
    "4": "Samuel Njoroge",
  };

  for (const id of INTERVIEW_CANDIDATE_IDS) {
    const iv = getInterview(id);
    if (!iv) continue;
    const label = formatShortDate(iv.date);
    const typeLabel = iv.type === "video" ? "Video call" : iv.type === "phone" ? "Phone call" : "In-person";
    notifs.push({
      id: `iv-${id}`,
      type: "interview",
      title: "Interview scheduled",
      body: `${typeLabel} with ${CANDIDATE_NAMES[id] ?? iv.candidateName} ${label} at ${iv.time}`,
      href: `/candidates/${id}`,
      time: label,
      timestamp: now - 60000,
    });
  }

  return notifs.sort((a, b) => b.timestamp - a.timestamp);
}

export default function NotificationBell({ isEmployer }: { isEmployer: boolean }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(loadRead);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setNotifications(buildNotifications());
  }, [open]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const all = new Set(notifications.map((n) => n.id));
    saveRead(all);
    setReadIds(all);
  }, [notifications]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function handleClick(notif: Notification) {
    markRead(notif.id);
    setOpen(false);
    navigate(notif.href);
  }

  if (!isEmployer) return null;

  const displayed = notifications.slice(0, 15);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-orange-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none"
            style={{ backgroundColor: TERRACOTTA }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ backgroundColor: "#fff" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[11px] text-gray-400 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-gray-100 text-gray-500"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#f3f4f6" }}>
                  <Bell className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">You're all caught up</p>
                <p className="text-xs text-gray-300 mt-1">No notifications yet</p>
              </div>
            ) : (
              displayed.map((notif) => {
                const isUnread = !readIds.has(notif.id);
                const { Icon, color, bg } = TYPE_META[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 relative"
                  >
                    {/* Unread dot */}
                    {isUnread && (
                      <div
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: TERRACOTTA }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}>
                          {notif.body}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{notif.time}</span>
                      </div>
                      <div
                        className="inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: bg, color }}
                      >
                        {notif.title}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <button
              onClick={() => { setOpen(false); navigate("/dashboard/pipeline"); }}
              className="w-full text-xs font-semibold text-center transition-colors hover:underline"
              style={{ color: TERRACOTTA }}
            >
              View all activity in Pipeline →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
