import { Link } from "wouter";
import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { motion } from "framer-motion";
import {
  Users, FileText, Briefcase, Globe, Award, BarChart3,
  UserCheck, Calculator, ArrowRight, CheckCircle2, TrendingUp, Clock
} from "lucide-react";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";
const CREAM = "#FEF9F4";

export const services: {
  slug: string;
  icon: React.ReactNode;
  label: string;
  shortDesc: string;
  highlights: string[];
  tag: string | null;
  comingSoon?: boolean;
}[] = [
  {
    slug: "employment-of-record",
    icon: <Users className="h-6 w-6" />,
    label: "Employment of Record",
    shortDesc: "Legally employ workers in Africa without a local entity.",
    highlights: ["Compliant local employment", "Multi-country coverage", "Handles payroll & benefits"],
    tag: "Most Popular",
  },
  {
    slug: "secondment-services",
    icon: <UserCheck className="h-6 w-6" />,
    label: "Secondment Services",
    shortDesc: "Transfer employees to client organizations seamlessly.",
    highlights: ["Flexible engagements", "Structured contracts", "Compliance guaranteed"],
    tag: null,
  },
  {
    slug: "expatriate-services",
    icon: <Globe className="h-6 w-6" />,
    label: "Expatriate Services",
    shortDesc: "End-to-end support for international employees in Africa.",
    highlights: ["Work permits & visas", "Relocation assistance", "Ongoing HR support"],
    tag: null,
  },
  {
    slug: "hr-consultancy",
    icon: <Briefcase className="h-6 w-6" />,
    label: "HR Consultancy",
    shortDesc: "Strategic HR advisory tailored to the African market.",
    highlights: ["Policy development", "Performance management", "Culture & OD"],
    tag: null,
  },
  {
    slug: "payroll-tax",
    icon: <Calculator className="h-6 w-6" />,
    label: "Payroll & Tax Admin",
    shortDesc: "Accurate, compliant payroll support for African expansion.",
    highlights: ["Multi-currency payroll", "Tax filings", "Social security compliance"],
    tag: "Essential",
    comingSoon: true,
  },
  {
    slug: "psychometric-assessments",
    icon: <BarChart3 className="h-6 w-6" />,
    label: "Psychometric Assessments",
    shortDesc: "Science-backed tools to evaluate talent fit and potential.",
    highlights: ["Cognitive ability tests", "Personality profiling", "Leadership potential"],
    tag: null,
  },
  {
    slug: "recruitment-services",
    icon: <FileText className="h-6 w-6" />,
    label: "Recruitment Services",
    shortDesc: "Executive search and mass recruitment across the continent.",
    highlights: ["C-suite search", "Sector specialists", "Fast turnaround"],
    tag: null,
  },
  {
    slug: "staff-outsourcing",
    icon: <Users className="h-6 w-6" />,
    label: "Staff Outsourcing",
    shortDesc: "Full workforce outsourcing so you can focus on core business.",
    highlights: ["Cost reduction", "HR administration", "Scalable teams"],
    tag: null,
  },
  {
    slug: "interim-management",
    icon: <Award className="h-6 w-6" />,
    label: "Interim Management",
    shortDesc: "Experienced interim executives for business continuity.",
    highlights: ["CEO / CFO / CHRO level", "Rapid onboarding", "Project delivery"],
    tag: null,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSEO
        title="HR Services in Africa | EOR, Payroll, Recruitment & Consulting"
        description="Comprehensive African HR services: Employment of Record, payroll & tax, talent recruitment, HR consultancy, psychometric assessments, and staff outsourcing. Live in Ghana, expanding across Africa."
        path="/services"
        breadcrumbs={[{ name: "HR Services", path: "/services" }]}
      />
      <Navbar />

      <section className="relative overflow-hidden flex items-end aspect-[4/3] sm:aspect-auto sm:h-[55vh] sm:min-h-[420px] sm:max-h-[660px]">
        <BlurImage
          src="/photos/pro-team-services.webp"
          alt="African professionals in a modern office — Bridgepath Africa HR Services"
          className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,14,28,0.72) 0%, rgba(8,14,28,0.30) 35%, transparent 65%)" }} />
        <div className="relative z-10 w-full pb-8 sm:pb-12 md:pb-16">
          <div className="container mx-auto px-5 sm:px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 sm:mb-4 text-xs sm:text-sm font-medium" style={{ backgroundColor: "rgba(255,255,255,0.85)", color: CORAL, border: `1px solid rgba(200,70,26,0.3)`, backdropFilter: "blur(8px)" }}>
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> HR &amp; Talent Solutions
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight text-white" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)" }}>
                Tailor-made HR &amp; Recruitment{" "}
                <span style={{ color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}>Solutions Across Africa</span>
              </h1>
              <p className="text-white/90 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)", fontWeight: 500 }}>
                From employment of record to executive search — BridgePath Africa handles your people operations so you can focus on growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {services.map((s) => (
              <motion.div key={s.slug} variants={cardVariants}>
                {s.comingSoon ? (
                  <div className="relative h-full">
                    <div className="h-full bg-white rounded-2xl border border-gray-100 p-7 flex flex-col opacity-60 pointer-events-none select-none">
                      <div className="flex items-start justify-between mb-5">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#e5e7eb", color: "#9ca3af" }}>
                          {s.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-gray-400">{s.label}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{s.shortDesc}</p>
                      <ul className="space-y-1.5 mb-5">
                        {s.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm" style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </div>
                    <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-6 pointer-events-none">
                      <div className="px-4 py-2 rounded-full text-xs font-semibold text-white shadow" style={{ backgroundColor: CORAL }}>
                        Launching Soon — Stay Tuned
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/services/${s.slug}`}>
                    <div className="group h-full bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 p-7 cursor-pointer flex flex-col" style={{ borderColor: "#F5E6D8" }}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: CORAL + "12", color: CORAL }}>
                          {s.icon}
                        </div>
                        {s.tag && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: CORAL + "18", color: CORAL }}>
                            {s.tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2 transition-colors group-hover:text-orange-700" style={{ color: CHARCOAL }}>{s.label}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{s.shortDesc}</p>
                      <ul className="space-y-1.5 mb-5">
                        {s.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: CORAL }} />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-1.5 text-sm font-semibold mt-auto" style={{ color: CORAL }}>
                        Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 text-white" style={{ backgroundColor: CHARCOAL }}>
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to expand in Africa?</h2>
          <p className="text-white/70 mb-8 text-lg">Talk to our experts about your HR and talent needs. We'll design a solution that fits.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 font-semibold text-white rounded-xl hover:opacity-90 transition-opacity text-base" style={{ backgroundColor: CORAL }}>
                Get in Touch
              </button>
            </Link>
            <Link href="/jobs">
              <button className="px-8 py-4 font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all text-base">
                Browse Job Board
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
