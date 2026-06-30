import { useState } from "react";
import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Mail, MapPin, Phone, Clock, Send, Loader2, ArrowRight,
  CheckCircle2, Building2, Users, Briefcase,
} from "lucide-react";

const CORAL = "#C04020";
const GOLD = "#F0A010";
const TEAL = "#1F7A78";
const INK = "#1E1511";
const CREAM = "#FEF9F4";

const ENQUIRY_TYPES = [
  { value: "hiring",         label: "I want to hire talent",             icon: <Building2 className="h-4 w-4" /> },
  { value: "job_seeker",     label: "I'm looking for a job",            icon: <Users className="h-4 w-4" /> },
  { value: "hr_services",    label: "HR Services enquiry (EOR, Payroll, etc.)", icon: <Briefcase className="h-4 w-4" /> },
  { value: "partnership",    label: "Partnership or press",             icon: <Mail className="h-4 w-4" /> },
  { value: "other",          label: "General question",                 icon: <ArrowRight className="h-4 w-4" /> },
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Please fill in all required fields" });
      return;
    }
    if (!email.includes("@")) {
      toast({ variant: "destructive", title: "Enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim(),
          type: type || "other",
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't send your message",
        description: "Please email us directly at support@bridgepathnetwork.com",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      <PageSEO
        title="Contact Bridgepath Africa | Get in Touch"
        description="Reach out to the Bridgepath Africa team for HR services, hiring, job search help, or partnerships. We're based in Accra, Ghana."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden flex items-center aspect-[4/3] sm:aspect-auto sm:min-h-[380px] sm:max-h-[580px] sm:h-[50vh]">
        <BlurImage src="/photos/blog-nssf-compliance.webp" alt="" className="absolute inset-0 w-full h-full object-cover object-top sm:object-center" loading="eager" decoding="async" />
        <div className="absolute inset-0" style={{ background: "rgba(8,14,28,0.38)" }} />
        <div className="relative z-10 w-full container mx-auto px-5 sm:px-6 max-w-4xl text-center py-12 sm:py-0">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 sm:mb-6"
              style={{ backgroundColor: CORAL + "30", color: "#fff", border: `1px solid rgba(255,255,255,0.3)` }}>
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-5">
              Let's build<br />
              <span style={{ color: "#fff" }}>something great</span> together
            </h1>
            <p className="text-white/70 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Whether you're hiring, looking for your next role, or exploring our HR services. Our team in Accra is ready to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info cards */}
      <section className="relative z-10 -mt-12 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Mail className="h-5 w-5" />,
              title: "Email us",
              detail: "support@bridgepathnetwork.com",
              sub: "We reply within a few hours",
              href: "mailto:support@bridgepathnetwork.com",
              color: CORAL,
            },
            {
              icon: <MapPin className="h-5 w-5" />,
              title: "Our office",
              detail: "Accra, Ghana",
              sub: "Serving Africa & Beyond",
              color: TEAL,
            },
            {
              icon: <Clock className="h-5 w-5" />,
              title: "Response time",
              detail: "Within a few hours",
              sub: "Monday to Friday, Ghana time (GMT+0)",
              color: TEAL,
            },
          ].map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.color + "15", color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{card.title}</p>
                {card.href ? (
                  <a href={card.href} className="font-semibold text-sm hover:underline" style={{ color: INK }}>{card.detail}</a>
                ) : (
                  <p className="font-semibold text-sm" style={{ color: INK }}>{card.detail}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="container mx-auto px-6 max-w-5xl py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Sidebar */}
          <FadeUp delay={0.1} className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: INK }}>How can we help?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choose the most relevant topic and our team will route your message to the right person quickly.
              </p>
            </div>

            <div className="space-y-2.5">
              {ENQUIRY_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className="w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-sm font-medium"
                  style={{
                    borderColor: type === t.value ? CORAL : "#e5e7eb",
                    backgroundColor: type === t.value ? CORAL + "08" : "white",
                    color: type === t.value ? CORAL : INK,
                    boxShadow: type === t.value ? `0 0 0 3px ${CORAL}20` : "none",
                  }}>
                  <span style={{ color: type === t.value ? CORAL : "#9ca3af" }}>{t.icon}</span>
                  {t.label}
                  {type === t.value && <CheckCircle2 className="h-4 w-4 ml-auto shrink-0" style={{ color: CORAL }} />}
                </button>
              ))}
            </div>

            <div className="rounded-2xl p-5 border" style={{ backgroundColor: TEAL + "08", borderColor: TEAL + "30" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TEAL }}>20+ Years of HR Experience</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bridgepath Africa has supported organisations across the African continent with employment of record, payroll management, and strategic HR.
              </p>
            </div>
          </FadeUp>

          {/* Form */}
          <FadeUp delay={0.2} className="lg:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center h-full flex flex-col items-center justify-center gap-5">
                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: CORAL + "15" }}>
                  <CheckCircle2 className="h-8 w-8" style={{ color: CORAL }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: INK }}>Message sent!</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Thanks for reaching out, {name.split(" ")[0]}. Our team will get back to you at <strong>{email}</strong> within a few hours.
                  </p>
                </div>
                <button onClick={() => { setSubmitted(false); setName(""); setEmail(""); setCompany(""); setMessage(""); setType(""); }}
                  className="mt-2 text-sm font-semibold px-5 py-2.5 rounded-xl border-2 transition-all hover:opacity-80"
                  style={{ borderColor: CORAL, color: CORAL }}>
                  Send another message
                </button>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-2" style={{ color: INK }}>Send us a message</h2>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">Fill in the form and we'll be in touch shortly.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full name *</label>
                      <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                        className="h-11 rounded-xl border-gray-200" required />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email address *</label>
                      <Input placeholder="name@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-gray-200" required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Company / Organisation <span className="text-gray-400 font-normal">(optional)</span></label>
                    <Input placeholder="Where do you work?" value={company} onChange={(e) => setCompany(e.target.value)}
                      className="h-11 rounded-xl border-gray-200" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Message *</label>
                    <textarea placeholder="Tell us what you need. The more detail you share, the better we can help."
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      rows={5} required
                      className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none leading-relaxed"
                      style={{ "--tw-ring-color": `${CORAL}40` } as any}
                    />
                  </div>

                  <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                    className="w-full h-12 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-md"
                    style={{ backgroundColor: CORAL }}>
                    {isLoading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      : <><Send className="h-4 w-4" /> Send Message</>}
                  </motion.button>

                  <p className="text-xs text-gray-400 text-center">
                    Or email us directly at{" "}
                    <a href="mailto:support@bridgepathnetwork.com" className="underline font-medium" style={{ color: CORAL }}>
                      support@bridgepathnetwork.com
                    </a>
                  </p>
                </form>
              </div>
            )}
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
