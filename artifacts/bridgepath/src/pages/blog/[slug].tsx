import { useRoute, Link, useLocation } from "wouter";
import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, ArrowRight, Briefcase, MapPin, DollarSign } from "lucide-react";
import { blogPosts } from "./index";

const CORAL = "#C04020";
const CHARCOAL = "#1C1917";
const INK = "#1E1511";

type CuratedJob = {
  id: number; title: string; employer: string; location: string;
  type: string; salaryMin: number; salaryMax: number; currency: string;
  industry: string; skills: string[];
};

const tagJobs: Record<string, CuratedJob[]> = {
  "Recruitment": [
    { id: 107, title: "HR Business Partner", employer: "Safaricom", location: "Nairobi, KE", type: "full_time", salaryMin: 42000, salaryMax: 65000, currency: "USD", industry: "Telecommunications", skills: ["HR Strategy", "Employee Relations", "Change Management"] },
    { id: 102, title: "Finance Manager", employer: "Equity Bank", location: "Nairobi, KE", type: "full_time", salaryMin: 45000, salaryMax: 70000, currency: "USD", industry: "Banking & Finance", skills: ["Financial Analysis", "IFRS", "Budgeting"] },
    { id: 108, title: "Sales Director – East Africa", employer: "SAP Africa", location: "Nairobi, KE", type: "full_time", salaryMin: 80000, salaryMax: 130000, currency: "USD", industry: "Technology", skills: ["Enterprise Sales", "B2B", "CRM"] },
  ],
  "AI & Talent": [
    { id: 101, title: "Software Engineer (Full Stack)", employer: "Andela", location: "Remote", type: "remote", salaryMin: 70000, salaryMax: 110000, currency: "USD", industry: "Technology", skills: ["React", "Node.js", "TypeScript"] },
    { id: 112, title: "Backend Engineer (Python)", employer: "Flutterwave", location: "Remote", type: "remote", salaryMin: 65000, salaryMax: 105000, currency: "USD", industry: "FinTech", skills: ["Python", "Django", "AWS"] },
    { id: 110, title: "Mobile App Developer (Android)", employer: "M-KOPA", location: "Kampala, UG", type: "full_time", salaryMin: 50000, salaryMax: 80000, currency: "USD", industry: "FinTech", skills: ["Kotlin", "Firebase", "REST APIs"] },
  ],
  "HR Strategy": [
    { id: 107, title: "HR Business Partner", employer: "Safaricom", location: "Nairobi, KE", type: "full_time", salaryMin: 42000, salaryMax: 65000, currency: "USD", industry: "Telecommunications", skills: ["HR Strategy", "Employee Relations"] },
    { id: 111, title: "Country Director – Tanzania", employer: "IRC", location: "Dar es Salaam, TZ", type: "full_time", salaryMin: 90000, salaryMax: 130000, currency: "USD", industry: "NGO / Development", skills: ["Program Management", "Leadership", "Fundraising"] },
    { id: 102, title: "Finance Manager", employer: "Equity Bank", location: "Nairobi, KE", type: "full_time", salaryMin: 45000, salaryMax: 70000, currency: "USD", industry: "Banking & Finance", skills: ["Financial Analysis", "IFRS", "Budgeting"] },
  ],
  "Career Growth": [
    { id: 101, title: "Software Engineer (Full Stack)", employer: "Andela", location: "Remote", type: "remote", salaryMin: 70000, salaryMax: 110000, currency: "USD", industry: "Technology", skills: ["React", "Node.js", "TypeScript"] },
    { id: 103, title: "Digital Marketing Specialist", employer: "Jumia", location: "Lagos, NG", type: "full_time", salaryMin: 30000, salaryMax: 50000, currency: "USD", industry: "E-Commerce", skills: ["SEO", "Google Ads", "Analytics"] },
    { id: 108, title: "Sales Director – East Africa", employer: "SAP Africa", location: "Nairobi, KE", type: "full_time", salaryMin: 80000, salaryMax: 130000, currency: "USD", industry: "Technology", skills: ["Enterprise Sales", "B2B", "CRM"] },
  ],
};

function safeUrl(url: string): string {
  const t = url.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("/") || t.startsWith("#") ? t : "#";
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const rows = tableRows.slice(2);
    elements.push(
      <div key={`table-${key++}`} className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: CHARCOAL }}>
              {headers.map((h, i) => (
                <th key={i} className="text-white px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide first:rounded-tl-lg last:rounded-tr-lg">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-gray-700 border-b border-gray-100">
                    {cell.trim().includes("✅") ? <span style={{ color: CORAL }} className="font-semibold">{cell.trim()}</span>
                      : cell.trim().includes("❌") ? <span className="text-red-400 font-semibold">{cell.trim()}</span>
                      : cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("|")) {
      inTable = true;
      const cells = line.split("|").filter(Boolean);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="text-2xl font-bold mt-10 mb-4" style={{ color: CHARCOAL }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      const text = line.slice(2, -2);
      elements.push(<p key={key++} className="font-semibold text-gray-900 mt-4 mb-1">{text}</p>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const text = line.slice(2);
      elements.push(
        <li key={key++} className="flex items-start gap-2 text-gray-700 text-base leading-relaxed my-1">
          <span className="h-1.5 w-1.5 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: CORAL }} />
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, (_m, t, u) => `<a href="${safeUrl(u)}" style="color:${CORAL}" class="hover:underline font-medium">${t}</a>`) }} />
        </li>
      );
    } else if (/^\d+\./.test(line)) {
      const text = line.replace(/^\d+\.\s*/, "");
      const num = parseInt(line);
      elements.push(
        <li key={key++} className="flex items-start gap-3 text-gray-700 text-base leading-relaxed my-2">
          <span className="h-6 w-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: CORAL }}>{num}</span>
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, (_m, t, u) => `<a href="${safeUrl(u)}" style="color:${CORAL}" class="hover:underline font-medium">${t}</a>`) }} />
        </li>
      );
    } else if (line.trim() !== "") {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, (_m, t, u) => `<a href="${safeUrl(u)}" style="color:${CORAL}" class="hover:underline font-medium">${t}</a>`);
      elements.push(<p key={key++} className="text-gray-700 text-base leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: html }} />);
    }
  }
  if (inTable) flushTable();
  return elements;
}

function fmtType(type: string) {
  return type === "remote" ? "Remote" : type === "full_time" ? "Full-time" : "Contract";
}

function fmtSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  return `${fmt(min)} – ${fmt(max)} ${currency}/yr`;
}

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug || "";
  const post = blogPosts.find((p) => p.slug === slug);
  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);
  const relatedJobs = post ? (tagJobs[post.tag] ?? tagJobs["Career Growth"]) : [];

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
          <Link href="/blog">
            <button className="px-6 py-3 font-semibold text-white rounded-xl" style={{ backgroundColor: CORAL }}>
              View all articles
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="relative overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-[50vh] sm:min-h-[340px] sm:max-h-[520px]">
        <BlurImage src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,14,28,0.78) 0%, rgba(8,14,28,0.25) 40%, transparent 66%)" }} />
        <div className="absolute bottom-0 left-0 right-0 px-4 py-8 md:p-10 z-10">
          <div className="container mx-auto max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white font-semibold mb-4 transition-colors" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              <ArrowLeft className="h-4 w-4" /> Back to Insights
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "rgba(255,255,255,0.85)", color: CORAL, backdropFilter: "blur(8px)" }}>
                <Tag className="h-3 w-3" /> {post.tag}
              </span>
              <span className="text-xs text-white flex items-center gap-1" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.45)" }}>{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 md:px-8 py-12">
        <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-100">
          <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-gray-100 shadow flex items-center justify-center shrink-0">
            <img src={post.author.avatar} alt="Bridgepath Africa" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">{post.author.role} · {post.date}</p>
          </div>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose-custom"
        >
          {renderContent(post.content)}
        </motion.article>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: `${CORAL}08`, border: `1px solid ${CORAL}25` }}>
            <h3 className="font-bold mb-2" style={{ color: CHARCOAL }}>Need HR or Recruitment Support in Africa?</h3>
            <p className="text-sm text-gray-600 mb-4">BridgePath Africa is building an HR & talent platform for teams operating across Africa.</p>
            <Link href="/contact">
              <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: CORAL }}>
                Contact Our Team
              </button>
            </Link>
          </div>
        </div>
      </div>

      {relatedJobs.length > 0 && (
        <section className="py-14" style={{ background: "#FEF9F4" }}>
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${CORAL}18` }}>
                  <Briefcase className="h-4 w-4" style={{ color: CORAL }} />
                </span>
                <h2 className="text-xl font-bold" style={{ color: INK }}>Open Roles You Might Like</h2>
              </div>
              <Link href="/jobs" className="flex items-center gap-1 text-sm font-semibold hover:opacity-75 transition-opacity" style={{ color: CORAL }}>
                Browse all jobs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {relatedJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.07 }}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex items-start gap-4"
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: CORAL }}
                  >
                    {initials(job.employer)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-orange-700 transition-colors">{job.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{job.employer} · {job.industry}</p>
                      </div>
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: job.type === "remote" ? "#E8F5E9" : `${CORAL}12`, color: job.type === "remote" ? "#2E7D32" : CORAL }}
                      >
                        {fmtType(job.type)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2.5">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{fmtSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s}</span>
                        ))}
                      </div>
                      <Link href="/jobs">
                        <button
                          className="shrink-0 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: CORAL }}
                        >
                          Apply
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              Roles matched to this article's topic · <Link href="/jobs" className="hover:underline font-medium" style={{ color: CORAL }}>See all openings</Link>
            </p>
          </div>
        </section>
      )}

      {otherPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <h2 className="text-xl font-bold mb-8" style={{ color: CHARCOAL }}>More Insights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}>
                  <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer">
                    <img src={p.image} alt={p.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: `${CORAL}15`, color: CORAL }}>{p.tag}</span>
                      <h3 className="font-semibold text-gray-900 mt-2 mb-1 text-sm leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">{p.title}</h3>
                      <div className="flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: CORAL }}>
                        Read more <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
