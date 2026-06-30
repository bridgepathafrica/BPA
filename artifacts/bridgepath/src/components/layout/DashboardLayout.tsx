import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { isDemoEmail } from "@/lib/demoAuth";
import {
  LayoutDashboard, Briefcase, FileText, User, LogOut,
  Settings, ChevronLeft, Menu, PlusCircle, Home, X, Users, MessageSquare,
  Sparkles, KanbanSquare, Bookmark, Send, ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";

const CORAL = "#D94F20";
const CHARCOAL = "#1C1917";
const SIDEBAR_BG = "#18110C";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  navItems: NavItem[];
  user: { name: string; email?: string };
  isEmployer: boolean;
  isDemo: boolean;
  location: string;
  collapsed?: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
  logout: () => void;
  onExitDemo: () => void;
}

function Sidebar({
  navItems, user, isEmployer, isDemo, location, collapsed = false, onCollapse, onClose, logout, onExitDemo,
}: SidebarProps) {
  const isActive = (href: string) =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: SIDEBAR_BG }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {!collapsed && (
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: CORAL }}>
              <img src="/logo-b.png" alt="Bridgepath Africa" width="20" height="20" className="h-5 w-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <span className="font-bold text-sm text-white tracking-tight truncate">
              Bridgepath<span style={{ color: CORAL }}> Africa</span>
            </span>
          </Link>
        )}
        {onClose && (
          <button onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-auto shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}
        {onCollapse && (
          <button onClick={onCollapse}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-auto shrink-0">
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Demo badge */}
      {isDemo && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ backgroundColor: CORAL + "18", border: `1px solid ${CORAL}35` }}>
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: CORAL }} />
          <p className="text-xs font-semibold" style={{ color: CORAL }}>Demo mode</p>
        </div>
      )}

      {/* User badge */}
      <div className="px-3 py-4 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: CORAL }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{isEmployer ? "Employer" : "Professional"}</p>
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pt-5 pb-1 shrink-0">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
            {isEmployer ? "Employer Tools" : "Career Tools"}
          </p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={`${item.href}-${idx}`}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/6"
              }`}
              style={active ? { backgroundColor: CORAL + "22", color: "white" } : {}}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" style={active ? { color: CORAL } : {}} />
              {!collapsed && (
                <>
                  <span className="flex-1" style={active ? { color: "white" } : {}}>{item.label}</span>
                  {active && <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CORAL }} />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-0.5 border-t pt-3 shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {isDemo && (
          <button onClick={onExitDemo}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: CORAL, backgroundColor: CORAL + "15" }}
            title={collapsed ? "Exit Demo" : undefined}>
            <Sparkles className="h-4 w-4 shrink-0" style={{ color: CORAL }} />
            {!collapsed && <span>Exit Demo</span>}
          </button>
        )}

        {isDemo && !collapsed && (
          <Link href="/auth/signup" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: CORAL }}>
            <User className="h-4 w-4 shrink-0" />
            <span>Create a real account</span>
          </Link>
        )}

        {!isDemo && (
          <>
            <Link href="/" onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-200 hover:bg-white/6 transition-all"
              title={collapsed ? "Back to Home" : undefined}>
              <Home className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Back to Home</span>}
            </Link>
            <Link href="/profile" onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-200 hover:bg-white/6 transition-all"
              title={collapsed ? "Settings" : undefined}>
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
          </>
        )}

        <button
          onClick={() => { logout(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={collapsed ? "Log out" : undefined}>
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (!user) return null;

  const isEmployer = user.role === "employer";
  const isDemo = isDemoEmail(user.email);

  const handleExitDemo = () => {
    logout();
    setMobileOpen(false);
    setLocation("/auth/login");
  };

  const navItems: NavItem[] = isEmployer
    ? [
        { href: "/dashboard/employer", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/pipeline", label: "Pipeline", icon: KanbanSquare },
        { href: "/my-jobs", label: "My Jobs", icon: ListChecks },
        { href: "/dashboard/jobs", label: "Job Board", icon: Briefcase },
        { href: "/candidates", label: "Candidates", icon: Users },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/profile", label: "Company Profile", icon: User },
      ]
    : [
        { href: "/dashboard/jobseeker", label: "Overview", icon: LayoutDashboard },
        { href: "/jobs", label: "Find Jobs", icon: Briefcase },
        { href: "/applications", label: "My Applications", icon: Send },
        { href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
        { href: "/cv-review", label: "AI CV Review", icon: FileText },
        { href: "/profile", label: "My Profile", icon: User },
      ];

  const getPageTitle = () => {
    if (location === "/dashboard/jobseeker") return "Professional Dashboard";
    if (location === "/dashboard/employer") return "Employer Dashboard";
    if (location === "/dashboard/pipeline") return "Candidate Pipeline";
    if (location === "/my-jobs") return "My Job Listings";
    if (location === "/jobs") return "Job Board";
    if (location === "/jobs/new") return "Post a Job";
    if (location === "/candidates") return "Candidates";
    if (location.startsWith("/candidates/")) return "Candidate Profile";
    if (location === "/messages") return "Messages";
    if (location === "/cv-review") return "AI CV Review";
    if (location === "/applications") return "My Applications";
    if (location === "/saved-jobs") return "Saved Jobs";
    if (location === "/profile") return isEmployer ? "Company Profile" : "My Profile";
    return isEmployer ? "Employer Dashboard" : "Professional Dashboard";
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F0EC" }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:block shrink-0 transition-all duration-300 shadow-xl"
        style={{ width: collapsed ? 68 : 240, position: "sticky", top: 0, height: "100vh" }}
      >
        <Sidebar
          navItems={navItems}
          user={user}
          isEmployer={isEmployer}
          isDemo={isDemo}
          location={location}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          logout={logout}
          onExitDemo={handleExitDemo}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop"
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside key="drawer"
              className="fixed left-0 top-0 bottom-0 z-50 w-72 md:hidden shadow-2xl"
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}>
              <Sidebar
                navItems={navItems} user={user} isEmployer={isEmployer}
                isDemo={isDemo} location={location} collapsed={false}
                onClose={() => setMobileOpen(false)} logout={logout}
                onExitDemo={handleExitDemo}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="bg-white border-b border-orange-50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-orange-50 transition-colors"
              onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-bold text-gray-900 leading-tight">{getPageTitle()}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Welcome back, {user.name.split(" ")[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isDemo && (
              <button onClick={handleExitDemo}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border"
                style={{ color: CORAL, borderColor: CORAL + "50", backgroundColor: CORAL + "10" }}>
                <Sparkles className="h-3 w-3" /> Exit Demo
              </button>
            )}
            <NotificationBell isEmployer={isEmployer} />
            {isEmployer ? (
              <Link href="/jobs/new">
                <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90 shadow-sm" style={{ backgroundColor: CORAL }}>
                  <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Post a Job</span>
                </button>
              </Link>
            ) : (
              <Link href="/jobs">
                <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90 shadow-sm" style={{ backgroundColor: CORAL }}>
                  <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Find Jobs</span>
                </button>
              </Link>
            )}
            <div className="md:hidden h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
              style={{ backgroundColor: CORAL }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto" style={{ backgroundColor: "#F5F0EC" }}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
