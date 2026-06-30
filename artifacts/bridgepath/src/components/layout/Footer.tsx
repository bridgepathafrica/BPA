import { Link } from "wouter";
import { Linkedin, Facebook, Youtube, Mail, MapPin } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useAuth } from "@/lib/auth";

const CORAL  = "#D94F20";
const DARK   = "#18110C";
const BORDER = "rgba(255,255,255,0.08)";

const serviceLinks = [
  { label: "Employment of Record",      href: "/services/employment-of-record" },
  { label: "HR Consultancy",            href: "/services/hr-consultancy" },
  { label: "Recruitment Services",      href: "/services/recruitment-services" },
  { label: "Payroll & Tax Admin",       href: "/services/payroll-tax" },
  { label: "Psychometric Assessments",  href: "/services/psychometric-assessments" },
  { label: "Staff Outsourcing",         href: "/services/staff-outsourcing" },
];

const companyLinks = [
  { label: "Home",           href: "/" },
  { label: "About Us",       href: "/about" },
  { label: "Insights & News",href: "/blog" },
  { label: "Contact Us",     href: "/contact" },
  { label: "Developers",     href: "/developers" },
];

const talentLinks = [
  { label: "Browse Jobs",     href: "/jobs" },
  { label: "AI CV Review",    href: "/cv-review" },
  { label: "Create Profile",  href: "/auth/signup" },
];

const hiringLinks = [
  { label: "Post a Job",          href: "/auth/signup?role=employer" },
  { label: "Browse Candidates",   href: "/candidates" },
  { label: "All HR Services",     href: "/services" },
  { label: "Partnership Enquiry", href: "/contact" },
];

const regions = [
  { label: "West Africa",    countries: "Ghana · Nigeria · Senegal · Ivory Coast" },
  { label: "East Africa",    countries: "Uganda · Tanzania · Rwanda · Ethiopia" },
  { label: "Southern Africa",countries: "South Africa · Zambia · Zimbabwe" },
];

export function Footer() {
  const { isAuthenticated, user } = useAuth();

  const cvLink = !isAuthenticated
    ? "/auth/signup?role=job_seeker"
    : user?.role === "job_seeker"
      ? "/cv-review"
      : "/dashboard/employer";

  return (
    <footer style={{ backgroundColor: DARK }} className="text-gray-400">

      {/* MAIN GRID */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >

        {/* Col 1 – Brand */}
        <div
          className="p-6 md:p-10 flex flex-col gap-5 col-span-2 md:col-span-3 lg:col-span-1 lg:border-r"
          style={{ borderColor: BORDER }}
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: CORAL }}>
              <img src="/logo-b.png" alt="Bridgepath Africa" width="24" height="24" className="h-6 w-6 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="font-bold text-base tracking-tight text-white">
                Bridgepath<span style={{ color: CORAL }}> Africa</span>
              </span>
              <span className="text-[10px] italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                Shaping People. Strengthening Institutions.
              </span>
            </div>
          </Link>

          <p className="text-xs leading-relaxed text-gray-500 max-w-[220px]">
            An HR and talent platform built on 20+ years of African workforce experience. Live in Ghana, expanding across Africa.
          </p>

          <div className="flex items-center gap-2.5">
            {[
              { icon: <FaInstagram className="h-3.5 w-3.5" />, href: "https://www.instagram.com/bridgepathafrica/", label: "Instagram" },
              { icon: <Facebook  className="h-3.5 w-3.5" />, href: "https://www.facebook.com/profile.php?id=61590423724691", label: "Facebook" },
              { icon: <Linkedin  className="h-3.5 w-3.5" />, href: "https://www.linkedin.com/company/bridgepath-africa/?viewAsMember=true", label: "LinkedIn" },
              { icon: <Youtube   className="h-3.5 w-3.5" />, href: "https://youtube.com/@bridgepathAfrica", label: "YouTube" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="h-7 w-7 flex items-center justify-center rounded-lg border transition-colors hover:text-white hover:border-white/25"
                style={{ borderColor: BORDER }}>
                {s.icon}
              </a>
            ))}
          </div>

          <div className="space-y-2.5 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            <a href="mailto:support@bridgepathnetwork.com" className="flex items-center gap-2 text-xs hover:text-white transition-colors">
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: CORAL }} />
              support@bridgepathnetwork.com
            </a>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: CORAL }} />
              Accra, Ghana (HQ)
            </div>
          </div>
        </div>

        {/* Col 2 – Services */}
        <div className="p-6 md:p-10 flex flex-col gap-4 lg:border-r" style={{ borderColor: BORDER }}>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest">Our Services</h4>
          <nav aria-label="HR services">
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-xs text-gray-500 hover:text-white transition-colors">{s.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Col 3 – Company */}
        <div className="p-6 md:p-10 flex flex-col gap-4 lg:border-r" style={{ borderColor: BORDER }}>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest">Company</h4>
          <nav aria-label="Company links">
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mt-4">For Talent</h4>
          <nav aria-label="Job seeker links">
            <ul className="space-y-3">
              {talentLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href === "/cv-review" ? cvLink : l.href} className="text-xs text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Col 4 – For Employers */}
        <div className="p-6 md:p-10 flex flex-col gap-4 lg:border-r" style={{ borderColor: BORDER }}>
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest">For Employers</h4>
          <nav aria-label="Employer links">
            <ul className="space-y-3">
              {hiringLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-gray-500 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <h4 className="text-white text-xs font-semibold uppercase tracking-widest mt-4">Pan-African Reach</h4>
          <ul className="space-y-3">
            {regions.map((r) => (
              <li key={r.label}>
                <div className="text-xs font-semibold text-gray-400 mb-0.5">{r.label}</div>
                <div className="text-xs text-gray-600">{r.countries}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 5 – Latest Insights */}
        <div className="p-6 md:p-10 flex flex-col gap-4 col-span-2 md:col-span-3 lg:col-span-1">
          <h4 className="text-white text-xs font-semibold uppercase tracking-widest">Latest Insights</h4>
          <ul className="space-y-4">
            {[
              { title: "How PEOs Differ from Employment Agencies",           href: "/blog/peo-vs-employment-agencies" },
              { title: "AI in Africa: Building a Modern Workforce",            href: "/blog/ai-africa-workforce" },
              { title: "New NSSF Rates: What Employers Need to Know",        href: "/blog/nssf-rates-2026" },
              { title: "How Africans Are Building Global Careers",           href: "/blog/africans-global-careers" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs text-gray-500 hover:text-white transition-colors leading-relaxed block">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 md:px-10 py-5">
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} Bridgepath Africa. All rights reserved.</p>
        <div className="flex gap-6 text-xs">
          <Link href="/privacy"          className="text-gray-700 hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms"            className="text-gray-700 hover:text-gray-400 transition-colors">Terms of Service</Link>
          <Link href="/cookies"          className="text-gray-700 hover:text-gray-400 transition-colors">Cookie Policy</Link>
          <Link href="/cookie-settings"  className="text-gray-700 hover:text-gray-400 transition-colors">Cookie Settings</Link>
        </div>
      </div>

    </footer>
  );
}
