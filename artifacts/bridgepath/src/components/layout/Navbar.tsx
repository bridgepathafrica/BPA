import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LogOut, User as UserIcon, Menu, X, ChevronDown, LayoutDashboard,
  Briefcase, Search, FileText, Building2, Users, Sparkles
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CORAL    = "#C8461A";
const CHARCOAL = "#1C1917";
const CREAM    = "#FFF8F3";

const professionalLinks = [
  { href: "/jobs",        icon: <Search   className="h-4 w-4" />, label: "Browse Jobs",    desc: "Find opportunities across Africa" },
  { href: "/cv-review",  icon: <Sparkles className="h-4 w-4" />, label: "AI CV Review",   desc: "Get expert feedback on your CV" },
  { href: "/auth/signup", icon: <FileText className="h-4 w-4" />, label: "Create Profile", desc: "Join the talent network" },
];

const employerLinks = [
  { href: "/employers",  icon: <Building2 className="h-4 w-4" />, label: "Post a Job",        desc: "Reach top African talent" },
  { href: "/candidates", icon: <Users     className="h-4 w-4" />, label: "Browse Candidates", desc: "Search pre-screened profiles" },
  { href: "/services",   icon: <Briefcase className="h-4 w-4" />, label: "HR Services",        desc: "EOR, payroll, outsourcing & more" },
];

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [empOpen, setEmpOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <header className="w-full">
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: "#0D1E38",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled ? "0 4px 28px rgba(8,20,50,0.55)" : "0 2px 12px rgba(8,20,50,0.28)",
        }}
      >
        <div className="mx-auto px-4 lg:px-8 h-[68px] flex items-center justify-between max-w-[1400px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => setMobileOpen(false)}>
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ background: "#C04020", boxShadow: "0 3px 12px rgba(192,64,32,0.50)" }}
            >
              <img
                src="/logo-b.png"
                alt="Bridgepath"
                width="22"
                height="22"
                decoding="async"
                className="h-[22px] w-[22px] object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <div className="font-extrabold text-[16px] tracking-tight leading-none text-white">
                BridgePath Africa
              </div>
              <span className="hidden xl:block text-[9px] font-bold tracking-[0.13em] uppercase mt-[3px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                Global Talent · African Opportunity
              </span>
            </div>
          </Link>

          {/* ── Desktop nav (lg+) ── */}
          <div className="hidden lg:flex items-center gap-0.5">

            <Link href="/"
              className="px-3 py-2 text-[13px] rounded-lg transition-all duration-150"
              style={{
                color: "white",
                backgroundColor: location === "/" ? "rgba(255,255,255,0.18)" : "transparent",
                fontWeight: location === "/" ? 700 : 500,
              }}
            >
              Home
            </Link>

            {/* For Employers */}
            <div className="relative" onMouseEnter={() => setEmpOpen(true)} onMouseLeave={() => setEmpOpen(false)}>
              <button
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150"
                style={{ color: "white", backgroundColor: isActive("/employers") || isActive("/candidates") || isActive("/services") ? "rgba(255,255,255,0.18)" : "transparent" }}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                Employers
                <motion.span animate={{ rotate: empOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {empOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-72 rounded-xl shadow-2xl py-3 z-50 overflow-hidden"
                    style={{ background: CREAM, border: "1px solid #F2D0BB" }}
                  >
                    <div className="px-4 pb-2 mb-1 border-b" style={{ borderColor: "#F2D0BB" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CHARCOAL }}>Hire & Grow Your Team</p>
                    </div>
                    {employerLinks.map((l) => (
                      <Link key={l.href} href={l.href}>
                        <div className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group hover:bg-orange-50">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: CHARCOAL + "12", color: CHARCOAL }}>
                            {l.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{l.label}</p>
                            <p className="text-xs text-gray-500">{l.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="px-4 pt-2 pb-1 border-t" style={{ borderColor: "#F2D0BB" }}>
                      <Link href="/auth/signup?role=employer" className="text-xs font-semibold hover:underline" style={{ color: CORAL }}>
                        Create employer account →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* For Professionals */}
            <div className="relative" onMouseEnter={() => setProfOpen(true)} onMouseLeave={() => setProfOpen(false)}>
              <button
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150"
                style={{ color: "white", backgroundColor: isActive("/jobs") || isActive("/cv-review") ? "rgba(255,255,255,0.18)" : "transparent" }}
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                Professionals
                <motion.span animate={{ rotate: profOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {profOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-72 rounded-xl shadow-2xl py-3 z-50 overflow-hidden"
                    style={{ background: CREAM, border: "1px solid #F2D0BB" }}
                  >
                    <div className="px-4 pb-2 mb-1 border-b" style={{ borderColor: "#F2D0BB" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CORAL }}>Job Seekers & Professionals</p>
                    </div>
                    {professionalLinks.map((l) => (
                      <Link key={l.href} href={l.href}>
                        <div className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group hover:bg-orange-50">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: CORAL + "18", color: CORAL }}>
                            {l.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-700">{l.label}</p>
                            <p className="text-xs text-gray-500">{l.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static links */}
            {[
              { href: "/about",   label: "About" },
              { href: "/blog",    label: "Insights" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="px-3 py-2 text-[13px] rounded-lg transition-all duration-150"
                style={{
                  color: "white",
                  backgroundColor: location.startsWith(link.href) ? "rgba(255,255,255,0.18)" : "transparent",
                  fontWeight: location.startsWith(link.href) ? 700 : 500,
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Auth buttons / user menu ── */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.09)" }}
                  >
                    <Avatar className="h-7 w-7">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <AvatarFallback style={{ backgroundColor: CORAL + "30", color: CORAL, fontSize: "11px" }}>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-[13px] font-medium text-white hidden sm:block">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 border-b">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide mt-1 inline-block px-2 py-0.5 rounded-full" style={{ backgroundColor: CORAL + "20", color: CORAL }}>
                      {user.role === "employer" ? "Employer" : "Professional"}
                    </span>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker"} className="cursor-pointer flex items-center w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" /><span>My Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center w-full">
                      <UserIcon className="mr-2 h-4 w-4" /><span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <button
                    className="px-4 py-2 text-[13px] font-semibold border rounded-lg transition-all hidden sm:block hover:bg-white/15"
                    style={{ color: "white", borderColor: "rgba(255,255,255,0.35)" }}
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button
                    className="px-4 py-2 text-[13px] font-bold rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: CORAL, color: "white", boxShadow: "0 2px 12px rgba(200,70,26,0.35)" }}
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )}

            {/* Mobile hamburger — shows below lg */}
            <motion.button
              className="lg:hidden ml-1 p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X className="h-5 w-5 text-white" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Menu className="h-5 w-5 text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.30, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0D1E38" }}
              className="lg:hidden"
            >
              <motion.div
                initial={{ y: -8 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 }}
                className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-2 pb-2" style={{ color: "rgba(255,255,255,0.45)" }}>For Employers</p>
                {employerLinks.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link href={l.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-2 text-sm font-medium rounded-lg transition-colors"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      <span style={{ color: CORAL }}>{l.icon}</span> {l.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-1 pb-2" style={{ color: "rgba(255,255,255,0.45)" }}>For Professionals</p>
                {professionalLinks.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.04 }}>
                    <Link href={l.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 py-2.5 px-2 text-sm font-medium rounded-lg transition-colors"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.40)" }}>{l.icon}</span> {l.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                {[
                  { href: "/",            label: "Home" },
                  { href: "/about",       label: "About" },
                  { href: "/blog",        label: "Insights" },
                  { href: "/developers",  label: "Developers" },
                  { href: "/contact",     label: "Contact" },
                ].map((link, i) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.30 + i * 0.04 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}
                      className="block py-2.5 px-2 text-sm font-medium rounded-lg"
                      style={{ color: location === link.href ? CORAL : "rgba(255,255,255,0.7)" }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {isAuthenticated && user && (
                  <div className="border-t pt-2 mt-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <Link href={user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker"} onClick={() => setMobileOpen(false)}
                      className="block py-2.5 px-2 text-sm font-medium"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      My Dashboard
                    </Link>
                    <button onClick={() => { logout(); setMobileOpen(false); }}
                      className="block py-2.5 px-2 text-sm font-medium text-red-400 w-full text-left"
                    >
                      Log out
                    </button>
                  </div>
                )}
                {!isAuthenticated && (
                  <motion.div
                    className="border-t pt-3 mt-2 flex gap-2"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.50 }}
                  >
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <button className="w-full py-3 text-sm font-medium border rounded-xl text-white"
                        style={{ borderColor: "rgba(255,255,255,0.25)" }}
                      >
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                      <button className="w-full py-3 text-sm font-semibold text-white rounded-xl"
                        style={{ backgroundColor: CORAL, boxShadow: "0 2px 10px rgba(200,70,26,0.4)" }}
                      >
                        Get Started
                      </button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
