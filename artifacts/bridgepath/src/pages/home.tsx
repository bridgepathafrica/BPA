import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Link } from "wouter";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { blogMeta } from "@/lib/blogMeta";
import {
  Users, FileText, Briefcase, Globe, Award, BarChart3,
  UserCheck, Calculator, ChevronDown, ChevronUp,
  TrendingUp, ShieldCheck, Star, CheckCircle2, ArrowRight, Clock,
  Code2, Landmark, Headphones, Crown, Search, Sparkles,
  Building2, MapPin, Zap, Target, ArrowUpRight, Play,
  Flag, TrendingDown, Layers, Rocket, Send, Mail,
  Linkedin, Instagram, Facebook
} from "lucide-react";

function FounderPhoto() {
  const [src, setSrc] = useState("/pamela.png");
  return (
    <img
      src={src}
      onError={() => setSrc("/blog/photo-7.webp")}
      alt="Pamela Kuma — Founder, BridgePath Africa"
      className="relative w-full rounded-2xl object-cover shadow-2xl"
      style={{ aspectRatio: "3/4" }}
    />
  );
}

const CORAL = "#C04020";
const GOLD = "#F0A010";
const TEAL = "#1F7A78";
const CHARCOAL = "#1C1917";
const CREAM = "#FEF9F4";
const SAND = "#F2EDE6";
const NAVY = "#0D1E38";

/* ── Reusable scroll-reveal wrapper ── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
        hidden: {}
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const focusAreas = [
  { icon: <Code2 className="h-6 w-6" />, label: "Technology" },
  { icon: <Landmark className="h-6 w-6" />, label: "Finance" },
  { icon: <Briefcase className="h-6 w-6" />, label: "HR & Operations" },
  { icon: <Headphones className="h-6 w-6" />, label: "Customer Success" },
  { icon: <Crown className="h-6 w-6" />, label: "Leadership" },
];

const whyPartner = [
  { icon: <TrendingUp className="h-7 w-7" />, title: "Global HR Leadership", desc: "Guidance shaped by senior hiring experience across African and international markets." },
  { icon: <ShieldCheck className="h-7 w-7" />, title: "20+ Years Experience", desc: "Built on practical workforce, recruitment, compliance, and people operations expertise." },
  { icon: <Users className="h-7 w-7" />, title: "Multi-Industry Reach", desc: "Supporting hiring across technology, finance, HR, operations, customer success, and leadership." },
  { icon: <Star className="h-7 w-7" />, title: "Diaspora + Local Talent", desc: "Connecting employers with returning diaspora professionals and strong local talent pools." },
];


const jobSeekerSteps = [
  { icon: <FileText className="h-5 w-5" />, step: "01", title: "Create Your Profile", desc: "Sign up and build a professional profile that showcases your skills, experience, and career goals." },
  { icon: <Search className="h-5 w-5" />, step: "02", title: "Discover Opportunities", desc: "Browse vetted roles in Ghana and remote positions open to African talent, with more African regions to follow as we grow." },
  { icon: <Sparkles className="h-5 w-5" />, step: "03", title: "Get AI CV Review", desc: "Use our AI-powered CV tool to sharpen your application and stand out to top employers." },
  { icon: <Target className="h-5 w-5" />, step: "04", title: "Apply & Advance", desc: "Apply with confidence. Track your applications and grow your career with Bridgepath Africa." },
];

const employerSteps = [
  { icon: <Building2 className="h-5 w-5" />, step: "01", title: "Create an Employer Account", desc: "Sign up as an employer to access Africa's most qualified diaspora and local professionals." },
  { icon: <Zap className="h-5 w-5" />, step: "02", title: "Post Your Role", desc: "Describe the position, required experience, and location. We'll surface the right candidates fast." },
  { icon: <Users className="h-5 w-5" />, step: "03", title: "Browse & Shortlist", desc: "Review pre-screened candidate profiles, assess CVs, and build your shortlist in one place." },
  { icon: <CheckCircle2 className="h-5 w-5" />, step: "04", title: "Hire with Confidence", desc: "Engage talent directly or let our HR team manage the full hiring and onboarding process." },
];

const newsArticles = blogMeta.slice(0, 4);

const faqs = [
  { q: "What does Bridgepath Africa do?", a: "Bridgepath Africa is a Human Resources Management Solutions and Executive Recruitment company headquartered in Accra, Ghana. With over 20 years of experience, we connect African talent with quality employers and provide comprehensive outsourced HR services across Africa." },
  { q: "Who is Bridgepath Africa for?", a: "Bridgepath Africa serves two groups: professionals (diaspora and local talent) looking for quality careers in Ghana, and employers seeking to hire verified African talent, locally or remotely. We are expanding across more African regions as we grow." },
  { q: "What services does Bridgepath Africa offer beyond recruitment?", a: "We offer Employment of Record, HR Consultancy, Payroll & Tax Administration, Psychometric Assessments, Staff Outsourcing, Interim Management, and Secondment Services." },
  { q: "Which countries is Bridgepath Africa operating in?", a: "We are currently live in Ghana, with plans to expand to other African regions as we grow. Our vision is a pan-African platform connecting talent and employers across the continent." },
  { q: "How does the AI CV Review work?", a: "Our AI CV Review tool analyses your CV against current hiring standards and provides structured feedback to improve your chances of getting shortlisted. Available to all registered professionals." },
  { q: "How can I get in touch with Bridgepath Africa?", a: "You can reach us via email at support@bridgepathnetwork.com or by submitting an enquiry through the contact form below. Our headquarters is in Accra, Ghana." },
];

export default function Home() {
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.0]);
  const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const [contactForm, setContactForm] = useState({ name: "", company: "", email: "", phone: "", type: "Hiring talent", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      toast({ variant: "destructive", title: "Name and email are required" });
      return;
    }
    setContactSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Failed to send");
      }
      toast({ title: "Enquiry received!", description: "Our team will get back to you within 1 to 2 business days." });
      setContactForm({ name: "", company: "", email: "", phone: "", type: "Hiring talent", message: "" });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not send enquiry", description: err instanceof Error ? err.message : "Please try again or email us directly." });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO
        title="Africa's Premier HR & Talent Platform | Live in Ghana"
        description="Connect with top African talent or find your next opportunity. Bridgepath Africa offers premium recruitment, EOR, payroll, and HR consulting. Live in Ghana, expanding across Africa."
        path="/"
      />
      <Navbar />

      {/* ── HERO — Full-bleed, bright & welcoming, text centred on image ── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ minHeight: "100svh" }}
      >

        {/* Full-bleed background image */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: heroImgScale, y: heroImgY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <picture className="contents">
            <img
              src="/photos/hero-team-user.webp"
              alt="Diverse African professional team collaborating — Bridgepath Africa"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 25%", imageRendering: "high-quality" as React.CSSProperties["imageRendering"] }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </motion.div>

        {/* Gradient overlay — keeps faces natural at top, adds depth at bottom for text */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top, rgba(8,14,28,0.78) 0%, rgba(8,14,28,0.30) 35%, rgba(8,14,28,0.08) 60%, transparent 100%)",
          }}
        />

        {/* Content — bottom-left, premium editorial layout */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col justify-end"
          style={{ y: heroContentY, opacity: heroContentOpacity }}
        >
          <div className="w-full px-5 sm:px-14 lg:px-20 pb-16 md:pb-20 lg:pb-24">
            <div className="max-w-2xl">

              {/* Status pill */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 sm:mb-7"
                style={{
                  backgroundColor: "rgba(200,70,26,0.90)",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/60">
                  Hire in Africa. Work in Africa. From Anywhere.
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                className="font-semibold leading-[1.08] tracking-[-0.01em] mb-3 sm:mb-5"
                style={{
                  fontSize: "clamp(1.9rem, 6vw, 4.8rem)",
                  fontFamily: "var(--app-font-display)",
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                Global Talent.<br />African Opportunity.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                className="mb-5 sm:mb-9 leading-[1.7] font-normal"
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                  maxWidth: "520px",
                  color: "rgba(255,255,255,0.72)",
                  textShadow: "0 1px 12px rgba(0,0,0,0.70)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.44 }}
              >
                Connecting ambitious employers with exceptional African and diaspora professionals, across Africa and beyond.
              </motion.p>

              {/* CTA row */}
              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center mb-6 sm:mb-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.58 }}
              >
                <Link href="/employers">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-lg font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{
                      backgroundColor: CORAL,
                      fontFamily: "var(--app-font-display)",
                      fontSize: "0.95rem",
                      boxShadow: "0 4px 24px rgba(200,70,26,0.55)",
                    }}
                  >
                    Hire Talent <ArrowUpRight className="h-4 w-4" />
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-lg font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    style={{
                      backgroundColor: "rgba(255,252,248,0.92)",
                      color: CHARCOAL,
                      fontFamily: "var(--app-font-display)",
                      fontSize: "0.95rem",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
                    }}
                  >
                    Explore Opportunities
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                className="flex items-center gap-5 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.75 }}
              >
                {[
                  { label: "20+ Years HR Expertise", dot: "rgba(255,255,255,0.35)" },
                  { label: "Live in Ghana", dot: CORAL },
                  { label: "Expanding Across Africa", dot: "rgba(255,255,255,0.35)" },
                ].map((item, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-white/50 tracking-wide"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.60)" }}
                  >
                    <span className="h-[5px] w-[5px] rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                    {item.label}
                  </span>
                ))}
              </motion.div>

            </div>
          </div>
        </motion.div>

      </section>

      {/* ── MILESTONES TIMELINE ── */}
      <div style={{ background: CHARCOAL }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 md:px-12 py-12 md:py-16">
          <FadeUp className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: CORAL + "25", color: CORAL }}>Our Journey</span>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-0" delay={0.1}>
            {[
              {
                year: "2024",
                text: "BridgePath Africa registered in Accra, Ghana to connect African and diaspora professionals with employers and opportunities across Africa.",
              },
              {
                year: "2025",
                text: "Platform development, employer outreach, and talent ecosystem building initiated.",
              },
              {
                year: "2026",
                text: "Launch of the BridgePath Africa platform in Ghana.",
              },
            ].map((item, i, arr) => (
              <motion.div
                key={item.year}
                variants={cardVariant}
                className={`flex flex-col px-6 sm:px-8 py-8 md:py-10 ${i < arr.length - 1 ? "md:border-r border-b md:border-b-0" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CORAL }} />
                  <span className="text-2xl font-extrabold text-white tracking-tight">{item.year}</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>{item.text}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </div>

      {/* ── DUAL USER JOURNEY ── */}
      <section style={{ background: CREAM }} className="py-16 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <FadeUp className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: CORAL + "15", color: CORAL }}>Two paths. One platform.</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold" style={{ color: CHARCOAL }}>
              How Bridgepath Africa<br /><span style={{ color: CORAL }}>works for you</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base sm:text-lg">Whether you're building a team or growing your career, we're built for your journey.</p>
          </FadeUp>

          <StaggerChildren className="grid md:grid-cols-2 gap-6 lg:gap-8" delay={0.1}>
            {/* Employer — CORAL/Orange — always first */}
            <motion.div variants={cardVariant} className="rounded-3xl overflow-hidden border-2" style={{ borderColor: CORAL }}>
              <div className="px-6 sm:px-8 py-6 flex items-center gap-4" style={{ backgroundColor: CORAL }}>
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">For Employers</p>
                  <h3 className="font-bold text-lg sm:text-xl text-white">Hire Africa's Best Talent</h3>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-8 space-y-6" style={{ background: CREAM }}>
                {employerSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4 sm:gap-5">
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: CORAL + "15", color: CORAL }}>
                        {s.icon}
                      </div>
                      <span className="text-[10px] font-extrabold tracking-widest" style={{ color: CORAL + "55" }}>{s.step}</span>
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-sm sm:text-base" style={{ color: CHARCOAL }}>{s.title}</p>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: "#7A6A5A" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 sm:px-8 py-6 border-t" style={{ background: CREAM, borderColor: "#E8D8C8" }}>
                <Link href="/auth/signup?role=employer">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 font-bold text-white rounded-xl text-sm" style={{ backgroundColor: CORAL }}>
                    Create an Employer Account
                  </motion.button>
                </Link>
                <Link href="/services">
                  <p className="text-center text-xs mt-3 font-semibold hover:underline" style={{ color: CORAL }}>Explore HR services →</p>
                </Link>
              </div>
            </motion.div>

            {/* Job Seeker — NAVY — always second */}
            <motion.div variants={cardVariant} className="rounded-3xl overflow-hidden border-2" style={{ borderColor: NAVY }}>
              <div className="px-6 sm:px-8 py-6 flex items-center gap-4" style={{ backgroundColor: NAVY }}>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">For Professionals</p>
                  <h3 className="font-bold text-lg sm:text-xl text-white">Build Your Career in Africa</h3>
                </div>
              </div>
              <div className="px-6 sm:px-8 py-8 space-y-6" style={{ background: CREAM }}>
                {jobSeekerSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4 sm:gap-5">
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: NAVY + "12", color: NAVY }}>
                        {s.icon}
                      </div>
                      <span className="text-[10px] font-extrabold tracking-widest" style={{ color: NAVY + "40" }}>{s.step}</span>
                    </div>
                    <div className="pt-1">
                      <p className="font-bold text-sm sm:text-base" style={{ color: CHARCOAL }}>{s.title}</p>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: "#7A6A5A" }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 sm:px-8 py-6 border-t" style={{ background: CREAM, borderColor: "#E8D8C8" }}>
                <Link href="/auth/signup">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 font-bold text-white rounded-xl text-sm" style={{ backgroundColor: NAVY }}>
                    Create Your Profile. It's Free
                  </motion.button>
                </Link>
                <Link href="/jobs">
                  <p className="text-center text-xs mt-3 font-semibold hover:underline inline-flex items-center gap-1 justify-center w-full" style={{ color: NAVY }}>Browse open roles <ArrowRight className="h-3 w-3" /></p>
                </Link>
              </div>
            </motion.div>

          </StaggerChildren>
        </div>
      </section>

      {/* ── FULL-BLEED: Focus Areas ── */}
      <section className="relative overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-[55vh] sm:min-h-[380px] sm:max-h-[640px]">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0D1E38 0%, #1a2d4a 50%, #0d1f3a 100%)", backgroundSize: "200% 200%", animation: "shimmer 1.6s ease-in-out infinite" }} />
        <motion.img
          src="/photos/modern-africa-office.webp"
          alt="Modern African office professionals"
          className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
          loading="lazy"
          decoding="async"
          initial={{ scale: 1.06, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-5 sm:px-8 md:px-12">
            <div className="max-w-lg">
              <FadeUp delay={0.05}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.65)" }}>Where we hire</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.45)" }}>
                  Focus areas for <span style={{ color: "#fff" }}>high-quality hiring</span>
                </h2>
              </FadeUp>
              <StaggerChildren className="flex flex-wrap gap-2 sm:gap-3 mt-5" delay={0.2}>
                {focusAreas.map((s) => (
                  <motion.div
                    key={s.label}
                    variants={cardVariant}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(10px)" }}
                  >
                    <span className="text-white/70">{s.icon}</span>
                    {s.label}
                  </motion.div>
                ))}
              </StaggerChildren>
              <FadeUp delay={0.4}>
                <Link href="/jobs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-6 inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-sm text-white"
                    style={{ backgroundColor: NAVY }}
                  >
                    Browse open roles <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </Link>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY BRIDGEPATH ── */}
      <section style={{ background: SAND }} className="py-16 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <FadeUp className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: CORAL + "18", color: CORAL }}>Why Bridgepath Africa</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-2" style={{ color: CHARCOAL }}>
              Built on <span style={{ color: CORAL }}>Real Hiring Experience</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-base sm:text-lg">
              20+ years of African workforce experience, global HR leadership, and a deep understanding of what great hiring looks like.
            </p>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" delay={0.1}>
            {whyPartner.map((w) => (
              <motion.div
                key={w.title}
                variants={cardVariant}
                whileHover={{ y: -6, boxShadow: "0 20px 48px -8px rgba(200,70,26,0.18), 0 4px 12px -4px rgba(28,16,8,0.08)" }}
                className="rounded-2xl p-6 sm:p-8 text-center border border-orange-100/60 transition-[transform,box-shadow]"
                style={{ background: "#FFFCF9", boxShadow: "0 2px 10px rgba(28,16,8,0.06)" }}
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 mx-auto"
                  style={{ backgroundColor: CORAL + "15", color: CORAL }}
                >
                  {w.icon}
                </motion.div>
                <h3 className="font-bold mb-3 text-sm sm:text-base" style={{ color: CHARCOAL }}>{w.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── REGIONAL: Where We Operate ── */}
      <section className="py-16 md:py-24" style={{ background: CREAM }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <FadeUp delay={0.05}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ backgroundColor: CORAL + "15", color: CORAL }}>Where we operate</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: CHARCOAL }}>
                <span style={{ color: CORAL }}>Live in Ghana</span><br /><span style={{ color: CHARCOAL }}>Expanding Across Africa</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-base sm:text-lg max-w-lg">
                Bridgepath Africa is live in Ghana, one of Africa's fastest-growing talent markets. We will expand to other African regions as we grow across the continent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto px-7 py-4 font-bold text-white rounded-xl" style={{ backgroundColor: CORAL }}>
                    Join early access
                  </motion.button>
                </Link>
                <Link href="/about">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto px-7 py-4 font-bold rounded-xl border-2" style={{ borderColor: CHARCOAL, color: CHARCOAL }}>
                    Learn our story →
                  </motion.button>
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                  <motion.img
                    src="/photos/accra-ghana-landmark.webp"
                    alt="Accra Ghana landmark, Where we operate"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white"
                  style={{ backgroundColor: CORAL, boxShadow: "0 8px 24px rgba(200,70,26,0.42), 0 2px 6px rgba(200,70,26,0.22)" }}
                >
                  Pan-African HR Expertise
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── HR IMAGE SECTION ── */}
      <section className="grid lg:grid-cols-2 min-h-[480px]" style={{ background: CHARCOAL }}>
        {/* Text side */}
        <div className="flex items-center px-8 sm:px-12 md:px-16 py-16 md:py-20 order-2 lg:order-1">
          <FadeUp delay={0.1}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white/50">Our services</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
              Full-service HR for the modern African workplace
            </h2>
            <p className="text-white/70 text-sm sm:text-base mb-8 leading-relaxed">
              From EOR to payroll, outsourcing to psychometric assessments — we handle the complexity so you can focus on growth.
            </p>
            <Link href="/services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white border border-white/30 hover:bg-white/10 transition-[transform,background] outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explore HR services <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </FadeUp>
        </div>

        {/* Image side — natural proportions, no crop */}
        <motion.div
          className="relative overflow-hidden order-1 lg:order-2 aspect-[4/3] lg:aspect-auto lg:min-h-[320px]"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <BlurImage
            src="/photos/blog-ai-africa-workforce.webp"
            alt="African HR leader"
            className="absolute inset-0 w-full h-full object-cover object-top lg:object-[50%_20%]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(8,14,28,0.18) 0%, transparent 50%)" }} />
        </motion.div>
      </section>

      {/* ── MEET THE FOUNDER ── */}
      <section style={{ background: SAND }} className="py-16 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl">
          <FadeUp>
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

              {/* Photo */}
              <div className="shrink-0 w-52 sm:w-64 lg:w-72">
                <div className="relative">
                  <div
                    className="absolute -inset-3 rounded-3xl"
                    style={{ background: `linear-gradient(135deg, ${CORAL}22, ${TEAL}22)` }}
                  />
                  <FounderPhoto />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ backgroundColor: CORAL + "15", color: CORAL }}>Meet the Founder</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: CHARCOAL }}>Pamela Kuma</h2>
                <p className="text-sm font-semibold mb-5" style={{ color: TEAL }}>Founder & CEO, BridgePath Africa</p>
                <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ color: "#5A4A3A" }}>
                  With over <strong>20 years of HR and talent acquisition experience</strong> across Africa and global markets — spanning Media, Technology, FinTech, and Energy — Pamela founded BridgePath Africa to bridge the gap between exceptional African talent and the employers who need them most.
                </p>
                <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: "#7A6A5A" }}>
                  Registered in Accra, Ghana in 2024, BridgePath Africa reflects her conviction that Africa's professionals deserve a platform built specifically for their ambitions — and that global employers are missing out by not hiring from this continent.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Link href="/about">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-[transform,opacity]"
                      style={{ backgroundColor: CORAL, boxShadow: `0 4px 18px ${CORAL}45` }}
                    >
                      Our full story <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Link>

                  <div className="flex items-center gap-3">
                    {[
                      { href: "https://www.linkedin.com/company/bridgepath-africa/?viewAsMember=true", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
                      { href: "https://www.instagram.com/bridgepathafrica/", icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
                      { href: "https://www.facebook.com/profile.php?id=61590423724691", icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors hover:text-white"
                        style={{ backgroundColor: CHARCOAL + "10", color: CHARCOAL }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = CORAL; (e.currentTarget as HTMLElement).style.color = "white"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = CHARCOAL + "10"; (e.currentTarget as HTMLElement).style.color = CHARCOAL; }}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: NAVY }} className="py-16 md:py-24 relative overflow-hidden grain">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <FadeUp delay={0.05}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>Get in touch</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Start building with<br /><span style={{ color: CORAL }}>Bridgepath Africa</span>
              </h2>
              <p className="text-white/75 mb-10 text-base sm:text-lg leading-relaxed">Tell us whether you want to find opportunities or hire top talent — we'll get back within 1–2 business days.</p>
              <div className="space-y-5 sm:space-y-6">
                {[
                  { icon: <MapPin className="h-5 w-5" />, label: "Headquarters", value: "Accra, Ghana", accent: CORAL },
                  { icon: <Globe className="h-5 w-5" />, label: "Operating in", value: "Ghana · Expanding Across Africa", accent: TEAL },
                  { icon: <UserCheck className="h-5 w-5" />, label: "Contact", value: "support@bridgepathnetwork.com", accent: CORAL },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: item.accent + "22", border: `1px solid ${item.accent}30` }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/45">{item.label}</p>
                      <p className="text-sm font-medium text-white mt-0.5">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <form className="rounded-3xl p-6 sm:p-8 md:p-10 bg-white" style={{ boxShadow: "0 32px 64px -16px rgba(28,16,8,0.28), 0 8px 16px -8px rgba(28,16,8,0.12), 0 0 0 1px rgba(28,16,8,0.04)" }} onSubmit={handleContactSubmit}>
                <h3 className="font-bold text-xl mb-6" style={{ color: CHARCOAL }}>Send an enquiry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Full Name</label>
                    <input className="w-full h-11 px-4 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2 focus:border-transparent" placeholder="Your full name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Company</label>
                    <input className="w-full h-11 px-4 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2" placeholder="Your company" value={contactForm.company} onChange={e => setContactForm({ ...contactForm, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Email Address</label>
                    <input type="email" className="w-full h-11 px-4 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Phone</label>
                    <input type="tel" className="w-full h-11 px-4 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2" placeholder="+233 …" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">I am looking to…</label>
                    <select className="w-full h-11 px-4 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2 bg-white text-gray-700" value={contactForm.type} onChange={e => setContactForm({ ...contactForm, type: e.target.value })}>
                      <option>Hire talent</option>
                      <option>Find a job or career opportunity</option>
                      <option>Outsource HR / payroll</option>
                      <option>Explore a partnership</option>
                      <option>Get more information</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Message</label>
                  <textarea className="w-full px-4 py-3 rounded-xl text-sm border border-orange-100 focus:outline-none focus:ring-2 resize-none" rows={4} placeholder="Tell us a bit more about what you need…" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} />
                </div>
                <motion.button
                  type="submit"
                  disabled={contactSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 font-bold text-white rounded-xl text-sm disabled:opacity-60"
                  style={{ backgroundColor: CORAL }}
                >
                  <span className="inline-flex items-center gap-2">{contactSubmitting ? "Sending…" : <><Send className="h-4 w-4" /> Submit Enquiry</>}</span>
                </motion.button>
              </form>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── NEWS & INSIGHTS ── */}
      <section style={{ background: CREAM }} className="py-16 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <FadeUp>
            <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4 mb-10 sm:mb-12">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: CORAL + "15", color: CORAL }}>Knowledge hub</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: CHARCOAL }}>News &amp; Insights</h2>
                <p className="text-gray-500 mt-2 text-sm sm:text-base">For organisations and professionals across Africa</p>
              </div>
              <Link href="/blog" className="flex items-center gap-1.5 text-sm font-bold shrink-0 hover:underline" style={{ color: CORAL }}>
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6" delay={0.1}>
            {newsArticles.map((article) => (
              <motion.div key={article.slug} variants={cardVariant}>
                <Link href={`/blog/${article.slug}`}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
                    className="group cursor-pointer flex flex-col rounded-2xl overflow-hidden border border-orange-50 hover:border-orange-200 transition-[transform,box-shadow,border-color]"
                  >
                    <div className="h-44 sm:h-48 overflow-hidden bg-orange-50">
                      <motion.img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-3" style={{ backgroundColor: CORAL + "15", color: CORAL }}>{article.tag}</span>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-orange-50">
                        <p className="text-xs text-gray-400">{article.date}</p>
                        <span className="text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: CORAL }}>Read <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24" style={{ background: SAND }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-4xl">
          <FadeUp className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ backgroundColor: CORAL + "15", color: CORAL }}>FAQs</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ color: CHARCOAL }}>Frequently asked questions</h2>
          </FadeUp>
          <StaggerChildren className="space-y-2" delay={0.05}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={cardVariant}
                className="rounded-2xl overflow-hidden border"
                style={{ backgroundColor: "#FFFCF9", borderColor: openFaq === i ? CORAL + "50" : "#E8D8C8" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-bold text-sm sm:text-base hover:bg-orange-50 transition-colors"
                  style={{ color: openFaq === i ? CORAL : CHARCOAL }}
                >
                  <span>{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5 shrink-0 ml-4" style={{ color: openFaq === i ? CORAL : "#9CA3AF" }} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-gray-600 leading-relaxed border-t border-orange-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section className="py-14 md:py-20" style={{ background: CORAL }}>
        <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-7xl">
          <FadeUp>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Ready to join Bridgepath Africa?</h2>
                <p className="text-white/70 text-base sm:text-lg">We are live in Ghana, expanding across Africa as we grow. Get started today.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-7 sm:px-8 py-4 font-bold text-sm rounded-xl bg-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{ color: CORAL, boxShadow: "0 4px 16px rgba(10,8,6,0.20), 0 1px 4px rgba(10,8,6,0.12)" }}
                  >
                    <span className="inline-flex items-center gap-2">Join the platform <ArrowRight className="h-4 w-4" /></span>
                  </motion.button>
                </Link>
                <Link href="/services">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-7 sm:px-8 py-4 font-bold text-sm rounded-xl text-white border border-white/30 hover:bg-white/10 transition-[transform,opacity] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  >
                    <span className="inline-flex items-center gap-2"><Layers className="h-4 w-4" /> Our services</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
