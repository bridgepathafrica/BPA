import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useGetJob, useCreateApplication, useGetMyApplications } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Briefcase, Globe, Calendar, DollarSign, Send,
  AlertCircle, CheckCircle2, Building2, Users, Clock, ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { isDemoEmail, addDemoApplication, getDemoApplications } from "@/lib/demoAuth";

const TERRACOTTA = "#C04020";
const INK = "#0D1B2A";

const demoMockJobs: Record<number, any> = {
  101: { id: 101, title: "Software Engineer (Full Stack)", employer: { name: "Andela" }, employerProfile: { companyName: "Andela", industry: "Technology", country: "Africa" }, location: "Remote", country: "Africa", type: "remote", salaryMin: 70000, salaryMax: 110000, currency: "USD", industry: "Technology", skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker"], isActive: true, createdAt: new Date().toISOString(), description: "Join Andela's world-class engineering team and work with global technology companies. You will architect and build scalable full-stack applications that serve millions of users across emerging markets.\n\nYou'll collaborate with cross-functional teams to deliver high-quality software solutions, mentor junior developers, and contribute to our engineering culture.", requirements: "5+ years of full-stack development experience.\nStrong proficiency in React, Node.js, and TypeScript.\nExperience with cloud platforms (AWS, GCP or Azure).\nAbility to work in a fully remote, globally distributed team.\nExcellent communication and problem-solving skills." },
  102: { id: 102, title: "Finance Manager", employer: { name: "Stanbic Bank" }, employerProfile: { companyName: "Stanbic Bank Ghana", industry: "Banking & Finance", country: "Ghana", companyWebsite: "https://stanbicbank.com.gh" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 45000, salaryMax: 70000, currency: "USD", industry: "Banking & Finance", skills: ["Financial Analysis", "IFRS", "Excel", "Budgeting", "Forecasting"], isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString(), description: "Stanbic Bank Ghana is seeking an experienced Finance Manager to oversee financial planning, reporting, and analysis across our Ghana operations.\n\nYou will lead a team of analysts, manage monthly close processes, and provide strategic financial insights to senior leadership.", requirements: "Degree in Finance, Accounting, or related field.\nCPA or ACCA qualification preferred.\n4+ years of financial management experience.\nStrong knowledge of IFRS and local tax regulations.\nAdvanced Excel and ERP skills." },
  103: { id: 103, title: "Digital Marketing Specialist", employer: { name: "Jumia" }, employerProfile: { companyName: "Jumia", industry: "E-Commerce", country: "Nigeria" }, location: "Lagos", country: "Nigeria", type: "full_time", salaryMin: 30000, salaryMax: 50000, currency: "USD", industry: "E-Commerce", skills: ["SEO", "Social Media", "Google Ads", "Analytics", "Content Marketing"], isActive: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), description: "Drive Jumia's digital marketing strategy across key African markets. You'll manage paid media campaigns, organic content, and performance analytics to grow our customer base and revenue.", requirements: "3+ years of digital marketing experience.\nProven track record in managing paid campaigns (Google, Meta).\nStrong analytical mindset with data-driven decision making.\nExperience with marketing automation tools." },
  104: { id: 104, title: "Supply Chain Analyst", employer: { name: "Dangote Group" }, employerProfile: { companyName: "Dangote Group", industry: "Manufacturing", country: "Nigeria" }, location: "Abuja", country: "Nigeria", type: "full_time", salaryMin: 38000, salaryMax: 58000, currency: "USD", industry: "Manufacturing", skills: ["Supply Chain", "ERP", "Data Analysis", "Logistics", "SAP"], isActive: true, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), description: "Join one of Africa's largest conglomerates and optimise our supply chain operations across Nigeria. You'll analyse data, improve processes, and support our logistics network.", requirements: "Degree in Supply Chain, Logistics, or Engineering.\n3+ years of supply chain experience.\nProficiency in ERP systems (SAP preferred).\nStrong Excel and data analysis skills." },
  105: { id: 105, title: "Clinical Pharmacist", employer: { name: "Korle Bu Teaching Hospital" }, employerProfile: { companyName: "Korle Bu Teaching Hospital", industry: "Healthcare", country: "Ghana" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 40000, salaryMax: 62000, currency: "USD", industry: "Healthcare", skills: ["Clinical Pharmacy", "Patient Care", "Drug Management", "Hospital Systems"], isActive: true, createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), description: "Provide exceptional pharmaceutical care at one of West Africa's leading teaching hospitals. Collaborate with clinical teams, manage formulary, and counsel patients on medication therapy.", requirements: "Bachelor's or PharmD in Pharmacy.\nActive pharmacist license in Ghana.\n2+ years of clinical pharmacy experience.\nStrong interpersonal and patient communication skills." },
  106: { id: 106, title: "Civil Engineer", employer: { name: "AECOM Africa" }, employerProfile: { companyName: "AECOM Africa", industry: "Engineering", country: "South Africa" }, location: "Johannesburg", country: "South Africa", type: "full_time", salaryMin: 55000, salaryMax: 85000, currency: "USD", industry: "Engineering", skills: ["AutoCAD", "Project Management", "Structural Design", "Civil Works", "Revit"], isActive: true, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), description: "Lead civil engineering projects for AECOM across Sub-Saharan Africa. You'll manage design, procurement, and construction phases for infrastructure, transport, and development projects.", requirements: "Degree in Civil Engineering.\nProfessional Engineer registration (or eligibility).\n5+ years of relevant project experience.\nProficiency in AutoCAD, Civil 3D, or Revit." },
  107: { id: 107, title: "HR Business Partner", employer: { name: "MTN Ghana" }, employerProfile: { companyName: "MTN Ghana", industry: "Telecommunications", country: "Ghana", companyWebsite: "https://mtn.com.gh" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 42000, salaryMax: 65000, currency: "USD", industry: "Telecommunications", skills: ["HR Strategy", "Employee Relations", "Change Management", "Performance Management", "HRIS"], isActive: true, createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), description: "Partner with business leaders at MTN Ghana — West Africa's leading telco — to deliver people strategy. Drive talent management, organisational effectiveness, and culture initiatives.", requirements: "Degree in HR, Business, or related field.\nHR certification (SHRM, CIPD or equivalent) preferred.\n4+ years as an HRBP or Senior HR Generalist.\nExperience in large, matrixed organisations." },
  108: { id: 108, title: "Sales Director – West Africa", employer: { name: "SAP Africa" }, employerProfile: { companyName: "SAP Africa", industry: "Technology", country: "Ghana" }, location: "Accra", country: "Ghana", type: "full_time", salaryMin: 80000, salaryMax: 130000, currency: "USD", industry: "Technology", skills: ["Enterprise Sales", "CRM", "B2B", "Deal Closing", "SAP ERP"], isActive: true, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), description: "Lead SAP's enterprise sales team across West Africa. Drive large, complex B2B technology deals, build executive relationships, and grow our market presence across Ghana, Nigeria, and Senegal.", requirements: "10+ years of enterprise software sales.\nConsistent track record of hitting $5M+ quotas.\nExperience selling ERP or cloud technology.\nStrong executive presence and stakeholder management." },
  109: { id: 109, title: "Graphic Designer", employer: { name: "Ogilvy Africa" }, employerProfile: { companyName: "Ogilvy Africa", industry: "Advertising", country: "Ghana" }, location: "Accra", country: "Ghana", type: "contract", salaryMin: 20000, salaryMax: 35000, currency: "USD", industry: "Advertising", skills: ["Adobe Creative Suite", "Figma", "Branding", "Typography", "Motion Design"], isActive: true, createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), description: "Create stunning visual work for Ogilvy's West African clients. You'll design everything from brand identities and campaign assets to digital content and social media graphics.", requirements: "3+ years of graphic design experience.\nExpert-level Adobe Creative Suite skills.\nStrong portfolio demonstrating brand and campaign work.\nAbility to manage multiple client briefs simultaneously." },
  110: { id: 110, title: "Mobile App Developer (Android)", employer: { name: "M-KOPA" }, employerProfile: { companyName: "M-KOPA", industry: "FinTech", country: "Uganda" }, location: "Kampala", country: "Uganda", type: "full_time", salaryMin: 50000, salaryMax: 80000, currency: "USD", industry: "FinTech", skills: ["Kotlin", "Android SDK", "REST APIs", "Firebase", "Jetpack Compose"], isActive: true, createdAt: new Date(Date.now() - 9 * 86400000).toISOString(), description: "Build the Android applications that help millions of underserved Africans access essential assets and financial services. Join M-KOPA's growing engineering team and make a direct social impact.", requirements: "3+ years of Android development.\nStrong Kotlin skills and familiarity with Jetpack Compose.\nExperience with REST APIs and Firebase.\nPassion for building products for emerging markets." },
  111: { id: 111, title: "Country Director – Tanzania", employer: { name: "IRC" }, employerProfile: { companyName: "IRC – International Rescue Committee", industry: "NGO / Development", country: "Tanzania" }, location: "Dar es Salaam", country: "Tanzania", type: "full_time", salaryMin: 90000, salaryMax: 130000, currency: "USD", industry: "NGO / Development", skills: ["Program Management", "Fundraising", "Leadership", "Reporting", "Donor Relations"], isActive: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), description: "Lead IRC's country operations in Tanzania, overseeing a portfolio of humanitarian and development programs. Manage government relations, donor engagement, and a team of 200+ staff.", requirements: "Master's degree in International Development or related field.\n10+ years of senior NGO leadership experience.\nProven donor management and fundraising track record.\nExperience working in East Africa essential." },
  112: { id: 112, title: "Backend Engineer (Python)", employer: { name: "Flutterwave" }, employerProfile: { companyName: "Flutterwave", industry: "FinTech", country: "Multiple" }, location: "Remote", country: "Multiple", type: "remote", salaryMin: 65000, salaryMax: 105000, currency: "USD", industry: "FinTech", skills: ["Python", "Django", "PostgreSQL", "AWS", "Redis", "Celery"], isActive: true, createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), description: "Help power Africa's payments infrastructure at one of the continent's leading fintech unicorns. Build high-throughput, resilient backend systems processing billions of dollars in transactions.", requirements: "4+ years of Python backend development.\nExpertise in Django or FastAPI.\nStrong PostgreSQL and distributed systems knowledge.\nExperience building high-availability systems at scale." },
};

export default function JobDetail() {
  const [match, params] = useRoute("/jobs/:id");
  const jobId = params?.id ? parseInt(params.id) : 0;

  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const isDemo = isDemoEmail(user?.email);

  const demoJob = isDemo ? (demoMockJobs[jobId] ?? demoMockJobs[101]) : null;

  const { data: apiJob, isLoading, error } = useGetJob(jobId, {
    query: {
      enabled: !!jobId && !isDemo,
      queryKey: ["job", jobId],
    },
  });

  const job: any = isDemo ? demoJob : apiJob;

  const { data: myApps } = useGetMyApplications({
    query: {
      enabled: isAuthenticated && !isDemo && user?.role === "job_seeker",
      queryKey: ["myApplications"],
    },
  });

  const applyMutation = useCreateApplication();

  const [demoApplied, setDemoApplied] = useState(false);
  useEffect(() => {
    if (isDemo) {
      setDemoApplied(getDemoApplications().some((a) => a.id === jobId));
    }
  }, [isDemo, jobId]);

  const hasApplied = isDemo
    ? demoApplied
    : myApps?.some((app) => app.jobId === jobId);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (isDemo) {
      const title = job?.title || "Position";
      const employerName = job?.employer?.name || job?.employerProfile?.companyName || "Company";
      addDemoApplication({
        id: jobId,
        job: { title, employer: { name: employerName } },
        status: "applied",
        createdAt: new Date().toISOString(),
      });
      setDemoApplied(true);
      toast({
        title: "Application Submitted!",
        description: `Your application for ${title} has been recorded. Check your dashboard to track it.`,
      });
      return;
    }

    applyMutation.mutate(
      { data: { jobId } },
      {
        onSuccess: () => {
          toast({
            title: "Application Submitted!",
            description: "You have successfully applied. Track your progress in your dashboard.",
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Application failed",
            description: (err as any)?.data?.message || "Could not submit application.",
          });
        },
      }
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#fee2e2" }}>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: INK }}>Job Not Found</h2>
            <p className="text-gray-500 mb-6">This job listing doesn't exist or has been removed.</p>
            <Link href="/jobs">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: TERRACOTTA }}>
                <ArrowLeft className="h-4 w-4" /> Back to Jobs
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const jobType = job?.type?.replace("_", " ") ?? "";

  const ogImage = jobId && jobId < 100
    ? `https://bridgepathnetwork.com/og-image/job/${jobId}`
    : undefined;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8f9fb" }}>
      <PageSEO
        title={job ? `${job.title} at ${job.employerProfile?.companyName ?? job.employer?.name ?? "Top Company"}` : "Job Listing"}
        description={job?.description ? job.description.slice(0, 158).trimEnd() + "…" : "View this job listing on Bridgepath Africa — Africa's premier HR hiring platform."}
        path={`/jobs/${jobId}`}
        image={ogImage}
      />
      <Navbar />

      <main className="flex-1">
        {/* ── Header Band ── */}
        <div style={{ backgroundColor: INK }}>
          <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
            {isLoading && !isDemo ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3 bg-white/10" />
                <Skeleton className="h-6 w-1/3 bg-white/10" />
              </div>
            ) : job ? (
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: TERRACOTTA + "25", color: TERRACOTTA }}>
                      {jobType}
                    </span>
                    {!job.isActive && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">Closed</span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                      {job.industry}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <Building2 className="h-4 w-4" style={{ color: TERRACOTTA }} />
                      {job.employer?.name || job.employerProfile?.companyName || "Company"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center gap-2 font-semibold" style={{ color: TERRACOTTA }}>
                        <DollarSign className="h-4 w-4" />
                        {job.currency} {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Posted {format(new Date(job.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>

                {/* Apply button */}
                <div className="shrink-0">
                  {user?.role === "employer" ? (
                    <button className="px-8 py-4 rounded-xl font-bold text-sm bg-white/10 text-white/50 cursor-not-allowed" disabled>
                      Employers cannot apply
                    </button>
                  ) : hasApplied ? (
                    <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white cursor-default" style={{ backgroundColor: "#1F7A78" }} disabled>
                      <CheckCircle2 className="h-5 w-5" /> Applied
                    </button>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: TERRACOTTA }}
                      onClick={handleApply}
                      disabled={!job.isActive || applyMutation.isPending}
                    >
                      {applyMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4.5 w-4.5" /> Apply Now
                        </>
                      )}
                    </button>
                  )}
                  {!hasApplied && job.isActive && (
                    <p className="text-xs text-white/40 text-center mt-2">Takes 30 seconds</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 md:px-8 pt-6">
          <Link href="/jobs">
            <button className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> All Jobs
            </button>
          </Link>
        </div>

        {/* ── Content ── */}
        <div className="container mx-auto px-4 md:px-8 py-8 pb-16">
          {isLoading && !isDemo ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ) : job ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left: Description + Requirements + Skills */}
              <div className="lg:col-span-2 space-y-8">

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-4" style={{ color: INK }}>About the role</h2>
                  <div className="space-y-3 text-gray-600 leading-relaxed">
                    {job.description.split("\n").filter(Boolean).map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>

                {job.requirements && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4" style={{ color: INK }}>Requirements</h2>
                    <ul className="space-y-2.5">
                      {job.requirements.split("\n").filter(Boolean).map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600">
                          <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: TERRACOTTA + "20" }}>
                            <CheckCircle2 className="h-3 w-3" style={{ color: TERRACOTTA }} />
                          </span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-4" style={{ color: INK }}>Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.skills || []).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-4 py-1.5 rounded-full text-sm font-semibold border"
                        style={{ backgroundColor: TERRACOTTA + "10", color: TERRACOTTA, borderColor: TERRACOTTA + "30" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile apply CTA */}
                <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                  {hasApplied ? (
                    <div className="flex items-center justify-center gap-2 font-bold" style={{ color: "#1F7A78" }}>
                      <CheckCircle2 className="h-5 w-5" /> You've applied for this role
                    </div>
                  ) : (
                    <button
                      className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: TERRACOTTA }}
                      onClick={handleApply}
                      disabled={!job.isActive || applyMutation.isPending}
                    >
                      {applyMutation.isPending ? "Submitting..." : "Apply Now →"}
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Company card + apply card */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                  <h3 className="font-bold text-base mb-5 pb-4 border-b border-gray-100" style={{ color: INK }}>
                    Company Overview
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: INK + "10" }}>
                        <Building2 className="h-4 w-4" style={{ color: INK }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Company</div>
                        <div className="font-semibold text-sm text-gray-900">{job.employerProfile?.companyName || job.employer?.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: INK + "10" }}>
                        <Briefcase className="h-4 w-4" style={{ color: INK }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Industry</div>
                        <div className="font-semibold text-sm text-gray-900">{job.employerProfile?.industry || job.industry || "Not specified"}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: INK + "10" }}>
                        <Globe className="h-4 w-4" style={{ color: INK }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Location</div>
                        <div className="font-semibold text-sm text-gray-900">{job.employerProfile?.country || job.country}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: TERRACOTTA + "15" }}>
                        <Clock className="h-4 w-4" style={{ color: TERRACOTTA }} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Job Type</div>
                        <div className="font-semibold text-sm capitalize" style={{ color: TERRACOTTA }}>{jobType}</div>
                      </div>
                    </div>
                  </div>

                  {job.employerProfile?.companyWebsite && (
                    <a
                      href={job.employerProfile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-4 w-4" /> Visit Website
                    </a>
                  )}
                </div>

                {/* Desktop apply card */}
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                  {hasApplied ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(31,122,120,0.12)" }}>
                        <CheckCircle2 className="h-6 w-6" style={{ color: "#1F7A78" }} />
                      </div>
                      <p className="font-bold" style={{ color: "#1F7A78" }}>You've applied!</p>
                      <p className="text-xs text-gray-500">Track your progress in your dashboard.</p>
                      <Link href="/dashboard/jobseeker">
                        <button className="mt-1 text-xs font-semibold underline" style={{ color: TERRACOTTA }}>View Dashboard →</button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-4">Ready to take the next step?</p>
                      <button
                        className="w-full py-4 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: TERRACOTTA }}
                        onClick={handleApply}
                        disabled={!job.isActive || applyMutation.isPending}
                      >
                        {applyMutation.isPending ? "Submitting..." : "Apply Now →"}
                      </button>
                      <p className="text-xs text-gray-400 mt-2">Takes less than 30 seconds</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
