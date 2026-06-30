import { useState } from "react";
import { Link } from "wouter";
import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { motion } from "framer-motion";
import { Linkedin, Facebook, Quote, CheckCircle2, Target, Eye, Users, Award, Lightbulb, Handshake, ArrowRight, GraduationCap, Star } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
const founderFallback = "/blog/photo-7.webp";

const CORAL = "#C04020";
const TEAL = "#1F7A78";
const CHARCOAL = "#1C1917";
const CREAM = "#FEF9F4";
const SAND = "#F2EDE6";
const NAVY = "#0D1E38";

const PAMELA_FALLBACK = founderFallback;

function FounderPhoto() {
  const [src, setSrc] = useState("/pamela.png");
  return (
    <img
      src={src}
      onError={() => setSrc(PAMELA_FALLBACK)}
      alt="Pamela Kuma — Founder, Bridgepath Africa"
      className="relative w-full max-w-xs mx-auto rounded-2xl object-cover shadow-2xl"
      style={{ aspectRatio: "3/4" }}
    />
  );
}

const timeline = [
  { year: "2024", event: "BridgePath Africa registered in Accra, Ghana to connect African and diaspora professionals with employers and opportunities across Africa." },
  { year: "2025", event: "Platform development, employer outreach, and talent ecosystem building initiated." },
  { year: "2026", event: "Launch of the BridgePath Africa platform in Ghana." },
];

const pillars = [
  { icon: <Users className="h-6 w-6" />, title: "Talent Acquisition", desc: "We help define roles, train hiring teams, and improve interview processes to find the right people, not just fill vacancies." },
  { icon: <Handshake className="h-6 w-6" />, title: "Conflict Resolution & Staff Relations", desc: "We train teams to handle conflict and build trust, because most people quit due to poor manager relationships." },
  { icon: <Lightbulb className="h-6 w-6" />, title: "Staff Training & Development", desc: "Training assessments, workshops, and train-the-trainer programs that boost staff confidence, morale, and empowerment." },
  { icon: <Award className="h-6 w-6" />, title: "Organizational Excellence", desc: "Bringing HR and institutional processes together to create cultures of performance, inclusion, and sustainable growth." },
];

const whyUs = [
  { title: "Deep HR Expertise", desc: "Pamela brings over 20 years of personal HR and talent acquisition experience across African and global markets, including Media, Technology, FinTech, and Energy." },
  { title: "Value-Aligned Partnership", desc: "We partner with organizations that prioritize diversity, inclusion, and excellence." },
  { title: "Flexible Service Delivery", desc: "In-person, virtual, and tailored consulting services to meet you where you are." },
  { title: "Built for Africa", desc: "Designed from the ground up for African professionals and employers — local insight, global standards." },
];

const stats = [
  { value: "2024", label: "Registered in Ghana" },
  { value: "2025", label: "Platform Development" },
  { value: "2026", label: "Platform Launch" },
  { value: "Africa", label: "Expanding Across" },
];

const certificates = [
  { title: "PSM I", body: "Professional Scrum Master I", area: "Agile & Scrum" },
  { title: "PSM II", body: "Professional Scrum Master II", area: "Advanced Scrum" },
  { title: "PSPO I", body: "Professional Scrum Product Owner I", area: "Product Ownership" },
  { title: "PSPO II", body: "Professional Scrum Product Owner II", area: "Advanced Product Ownership" },
  { title: "20+ Years Experience", body: "HR & Talent Acquisition Leadership", area: "Human Resources" },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO
        title="About Bridgepath Africa | African HR & Talent Platform"
        description="Learn about Bridgepath Africa's mission and founding team. Founded in Ghana in 2025 — connecting African and diaspora professionals with global employers."
        path="/about"
        breadcrumbs={[{ name: "About Us", path: "/about" }]}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden flex items-end aspect-[4/3] sm:aspect-auto sm:h-[60vh] sm:min-h-[400px] sm:max-h-[700px]">
        <BlurImage
          src="/photos/blog-peo-hr-team.webp"
          alt="African HR professional — Bridgepath Africa"
          className="absolute inset-0 w-full h-full object-cover object-top"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, rgba(8,14,28,0.75) 0%, rgba(8,14,28,0.22) 38%, transparent 62%)" }} />
        <div className="relative z-[2] w-full pb-14 md:pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5" style={{ backgroundColor: "rgba(255,255,255,0.85)", color: CORAL, border: `1px solid rgba(200,70,26,0.3)` }}>About Bridgepath Africa</span>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-5 leading-tight" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.55)", fontFamily: "var(--app-font-display)" }}>
                Shaping People.<br />
                Strengthening Institutions.
              </h1>
              <p className="text-white/90 text-base md:text-xl max-w-2xl leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                Your roadmap to organizational excellence, through HR solutions across Africa and beyond.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-b" style={{ backgroundColor: CREAM, borderColor: "#E8D8C8" }}>
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl font-bold mb-1" style={{ color: CORAL }}>{s.value}</div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "#7A6A5A" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 md:py-28" style={{ background: CREAM }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row gap-14 items-start">
              <div className="md:w-2/5 shrink-0">
                <div className="relative">
                  <FounderPhoto />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[240px] rounded-xl p-3 text-white" style={{ backgroundColor: "rgba(28,25,23,0.92)" }}>
                    <p className="font-bold text-sm">Pamela Kuma</p>
                    <p className="text-xs text-gray-300">Founder & CEO</p>
                  </div>
                </div>

                {/* Founder quote below photo */}
                <div className="mt-8 px-1">
                  <p className="text-sm italic leading-relaxed text-center font-medium" style={{ color: CORAL }}>
                    "Africa's talent is everywhere. BridgePath brings it home — and connects it to opportunity."
                  </p>
                  <p className="text-xs text-center mt-2 font-semibold text-gray-400">— Pamela Kuma, Founder & CEO</p>
                </div>
              </div>

              <div className="md:w-3/5 pt-4">
                <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: CORAL }}>About the Founder</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: CHARCOAL }}>Meet Pamela Kuma</h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-base">
                  Pamela Kuma is a seasoned HR and Talent Acquisition leader with more than 20 years of experience helping organizations attract, hire, and develop exceptional talent across Africa and global markets.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4 text-base">
                  Throughout her career, she has led recruitment and workforce initiatives across Media, Technology, FinTech, Energy, and Utility sectors, working with organizations including National Grid, ActionIQ, and other high-growth and enterprise environments. She has supported organizations ranging from startups and scale-ups to large enterprise businesses, giving her a unique perspective on building teams at every stage of growth.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4 text-base">
                  Her experience spans executive recruitment, workforce planning, talent strategy, HR transformation, recruiting operations, employer branding, and capacity building. Over the course of her career, she has successfully helped organizations fill more than 48 critical roles within six months during periods of rapid growth, generated over $200,000 in recruiting-related cost savings, and implemented process improvements that reduced talent acquisition and operational costs by as much as 30–40%.
                </p>

                <div className="flex items-start gap-3 p-5 rounded-xl mb-5" style={{ backgroundColor: CORAL + "08", border: `1px solid ${CORAL}25` }}>
                  <Quote className="h-6 w-6 shrink-0 mt-0.5" style={{ color: CORAL }} />
                  <blockquote className="text-gray-700 italic leading-relaxed font-medium text-base">
                    "Great organizations are built by great people — and the right connections make all the difference."
                  </blockquote>
                </div>

                <p className="text-gray-600 leading-relaxed mb-4 text-base">
                  With a deep understanding of both African talent markets and international hiring standards, Pamela founded BridgePath Africa to address a critical challenge: connecting exceptional talent with meaningful opportunities while helping organizations build stronger, more effective teams.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 text-base">
                  Through BridgePath Africa, Pamela combines global best practices with local market insight to support employers in hiring with confidence, developing sustainable talent pipelines, and building cultures that drive long-term success. BridgePath Africa is currently serving clients and professionals in Ghana, with plans to expand into additional African markets as the platform grows.
                </p>

                {/* Experience highlights */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { label: "Media & Advertising" },
                    { label: "Technology & FinTech" },
                    { label: "Energy & Gas" },
                    { label: "Executive Recruitment" },
                  ].map((area) => (
                    <div key={area.label} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CORAL }} />
                      {area.label}
                    </div>
                  ))}
                </div>

                {/* Social media links */}
                <div className="flex items-center gap-3">
                  <a href="https://www.linkedin.com/company/bridgepath-africa/?viewAsMember=true" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: CORAL + "12", color: CORAL, border: `1px solid ${CORAL}25` }}>
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                  <a href="https://www.instagram.com/bridgepathafrica/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: CORAL + "12", color: CORAL, border: `1px solid ${CORAL}25` }}>
                    <FaInstagram className="h-4 w-4" /> Instagram
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61590423724691" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: CORAL + "12", color: CORAL, border: `1px solid ${CORAL}25` }}>
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificates & Credentials */}
      <section className="py-20 md:py-24" style={{ backgroundColor: CREAM }}>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: CORAL }}>Credentials</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: CHARCOAL }}>Certifications &amp; Qualifications</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Pamela combines more than 20 years of HR and Talent Acquisition leadership experience with internationally recognized Agile and Scrum credentials, reflecting her commitment to continuous learning, strategic execution, and modern approaches to leadership, workforce planning, and organizational growth.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border hover:shadow-md transition-all" style={{ borderColor: "#F5E6D8" }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: CORAL + "15" }}>
                  <GraduationCap className="h-5 w-5" style={{ color: CORAL }} />
                </div>
                <p className="font-bold text-base mb-1" style={{ color: CHARCOAL }}>{cert.title}</p>
                <p className="text-xs text-gray-500 mb-2">{cert.body}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: TEAL + "18", color: TEAL }}>
                  {cert.area}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20" style={{ background: SAND }}>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: CORAL }}>Our Purpose</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: CHARCOAL }}>Mission &amp; Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl p-8 text-white shadow-xl" style={{ background: CORAL }}>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(255,255,255,0.20)" }}>
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/85 leading-relaxed text-base">
                To shape Africa's workforce by connecting talented professionals, whether at home or in the diaspora, with employers who value them, while equipping institutions with the HR systems, leadership, and culture they need to grow with confidence.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl p-8 border-2 bg-white shadow-sm" style={{ borderColor: TEAL + "40" }}>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: TEAL + "12" }}>
                <Eye className="h-6 w-6" style={{ color: TEAL }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: CHARCOAL }}>Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                To become Africa's most trusted bridge between people and opportunity: a continent-wide network where every professional finds work that fits their potential, and every institution finds the people who will define its future.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20" style={{ backgroundColor: CREAM }}>
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: CORAL }}>Our Journey</p>
            <h2 className="text-3xl font-bold" style={{ color: CHARCOAL }}>Milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ backgroundColor: CORAL + "30" }} />
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex gap-6 items-start pl-4">
                  <div className="relative z-10 h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ backgroundColor: CORAL }}>
                    {item.year.slice(2)}
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1 border" style={{ borderColor: "#F5E6D8" }}>
                    <span className="text-sm font-extrabold" style={{ color: CORAL }}>{item.year}</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20" style={{ background: CREAM }}>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: CORAL }}>Our Framework</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: CHARCOAL }}>Pillars of Bridgepath</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Our comprehensive framework for institutional success and human capital excellence.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border hover:shadow-lg transition-shadow" style={{ borderColor: "#F5E6D8" }}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: CORAL + "15" }}>
                  <span style={{ color: CORAL }}>{p.icon}</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: CHARCOAL }}>{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20" style={{ background: CORAL }}>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3 text-white/70">Why Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose Bridgepath?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {whyUs.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start p-5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-white" />
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: SAND }}>
        <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4" style={{ color: CHARCOAL }}>Ready to Transform Your Organization?</h2>
          <p className="text-gray-500 mb-8">Schedule a free consultation and discover how Bridgepath Africa can revolutionize your people strategy.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link href="/contact">
              <button className="px-8 py-3.5 font-semibold text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2" style={{ backgroundColor: CORAL }}>
                Get in Touch <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-3.5 font-semibold rounded-xl border-2 hover:bg-orange-50 transition-all" style={{ color: CHARCOAL, borderColor: CHARCOAL + "40" }}>
                View Services
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-400">Email: <a href="mailto:support@bridgepathnetwork.com" className="underline hover:text-gray-600">support@bridgepathnetwork.com</a></p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
