import { Link } from "wouter";
import { BlurImage } from "@/components/ui/blur-image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Briefcase, Search, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const CORAL = "#C04020";
const NAVY = "#0D1E38";

export default function EmployersPage() {
  const { isAuthenticated, user } = useAuth();
  const employerHref = (path: string) =>
    !isAuthenticated
      ? "/auth/signup?role=employer"
      : user?.role === "employer"
        ? path
        : "/dashboard/jobseeker";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSEO
        title="Hire African Talent | Post Jobs & Find Candidates"
        description="Access pre-screened African professionals. Post jobs, browse verified candidates, and get EOR and payroll support. Live in Ghana, expanding across Africa."
        path="/employers"
        breadcrumbs={[{ name: "For Employers", path: "/employers" }]}
      />
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24" style={{ backgroundColor: "#FFF8F2" }}>
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: CORAL }}>For Employers</p>
                <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: NAVY }}>Hire the Right Talent Across Africa</h1>
                <p className="text-gray-600 mt-5 leading-relaxed text-base md:text-lg">
                  Bridgepath Africa helps employers connect with diaspora and local professionals in Ghana and remote African markets, with more regions to follow as we grow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href={employerHref("/jobs/new")} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: CORAL }}>
                    <Briefcase className="h-4 w-4" /> Post a Job
                  </Link>
                  <Link href={employerHref("/candidates")} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border" style={{ color: NAVY, borderColor: "#E0D4C4" }}>
                    <Search className="h-4 w-4" /> Browse Candidates
                  </Link>
                </div>
              </div>

              {/* Right column: image + workflow card */}
              <div className="space-y-5">
                <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/9" }}>
                  <BlurImage
                    src="/photos/boardroom-clean.webp"
                    alt="African HR professionals closing a deal in a modern boardroom"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute bottom-4 left-5 right-5">
                    <p className="text-white text-xs font-semibold" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7), 0 2px 16px rgba(0,0,0,0.5)" }}>Connecting Africa's best talent with ambitious employers</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-7" style={{ borderColor: "#E0D4C4" }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: CORAL + "15", color: CORAL }}>
                      <Users className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold" style={{ color: NAVY }}>Simple V1 hiring workflow</h2>
                  </div>
                  <div className="space-y-4">
                    {["Post focused roles for Ghana or remote African teams", "Review candidate profiles and shortlists", "Message promising professionals directly"].map((item, index) => (
                      <div key={item} className="flex gap-3 items-start">
                        <span className="h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center text-white shrink-0 mt-0.5" style={{ backgroundColor: CORAL }}>{index + 1}</span>
                        <p className="text-sm text-gray-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Bridgepath Africa */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CORAL }}>Why Bridgepath Africa</p>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>Built for African hiring</h2>
              <p className="text-gray-500 mt-3 text-sm max-w-xl mx-auto">
                From early-stage hiring to full workforce outsourcing. We cover the full spectrum.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { title: "Pan-African reach", desc: "Live in Ghana now, expanding to other African regions as we grow." },
                { title: "Compliance-first", desc: "Employment of Record, payroll, and tax handled correctly." },
                { title: "Diaspora & local talent", desc: "Access returning professionals and local talent pools." },
                { title: "HR advisory included", desc: "Strategic HR support alongside your hiring needs." },
                { title: "Fast time-to-hire", desc: "Pre-screened candidates ready for review in days." },
                { title: "15+ years experience", desc: "Senior African HR leadership behind every engagement." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start p-4 rounded-xl border" style={{ backgroundColor: "#FFF8F2", borderColor: "#E0D4C4" }}>
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: CORAL }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: NAVY }}>{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/auth/signup?role=employer" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: CORAL }}>
                Create an Employer Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
