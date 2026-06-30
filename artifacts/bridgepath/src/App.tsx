import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BackToTop } from "@/components/ui/BackToTop";
import { ChatSupport } from "@/components/ui/ChatSupport";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getAuthToken } from "@/lib/auth";

setAuthTokenGetter(getAuthToken);

import Home from "@/pages/home";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
const DevelopersPage    = lazy(() => import("@/pages/developers"));
const ApiReferencePage  = lazy(() => import("@/pages/developers/api"));

const Login               = lazy(() => import("@/pages/auth/login"));
const Signup              = lazy(() => import("@/pages/auth/signup"));
const NotFound            = lazy(() => import("@/pages/not-found"));
const JobSeekerDashboard  = lazy(() => import("@/pages/dashboard/jobseeker"));
const EmployerDashboard   = lazy(() => import("@/pages/dashboard/employer"));
const JobsList            = lazy(() => import("@/pages/jobs/index"));
const JobDetail           = lazy(() => import("@/pages/jobs/[id]"));
const PostJob             = lazy(() => import("@/pages/jobs/new"));
const CvReview            = lazy(() => import("@/pages/cv-review/index"));
const Profile             = lazy(() => import("@/pages/profile/index"));
const ServicesPage        = lazy(() => import("@/pages/services/index"));
const ServiceDetail       = lazy(() => import("@/pages/services/[slug]"));
const AboutPage           = lazy(() => import("@/pages/about"));
const BlogIndex           = lazy(() => import("@/pages/blog/index"));
const BlogPost            = lazy(() => import("@/pages/blog/[slug]"));
const LegalPage           = lazy(() => import("@/pages/legal"));
const CookieSettingsPage  = lazy(() => import("@/pages/cookie-settings"));
const EmployersPage       = lazy(() => import("@/pages/employers"));
const AuthCallback        = lazy(() => import("@/pages/auth/callback"));
const ForgotPassword      = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPassword       = lazy(() => import("@/pages/auth/reset-password"));
const VerifyEmail         = lazy(() => import("@/pages/auth/verify-email"));
const OAuthCallback       = lazy(() => import("@/pages/auth/oauth-callback"));
const MagicLinkVerify       = lazy(() => import("@/pages/auth/magic-link-verify"));
const VerifyEmailChange     = lazy(() => import("@/pages/auth/verify-email-change"));
const JobSeekerOnboarding = lazy(() => import("@/pages/onboarding/jobseeker"));
const EmployerOnboarding  = lazy(() => import("@/pages/onboarding/employer"));
const CandidatesPage      = lazy(() => import("@/pages/candidates"));
const CandidateProfilePage= lazy(() => import("@/pages/candidates/[id]"));
const MessagesPage        = lazy(() => import("@/pages/messages"));
const DashboardJobs       = lazy(() => import("@/pages/dashboard/jobs"));
const PipelinePage        = lazy(() => import("@/pages/dashboard/pipeline"));
const ContactPage         = lazy(() => import("@/pages/contact"));
const SavedJobsPage       = lazy(() => import("@/pages/saved-jobs/index"));
const ApplicationsPage    = lazy(() => import("@/pages/applications/index"));
const MyJobsPage          = lazy(() => import("@/pages/my-jobs/index"));
const AdminDashboard      = lazy(() => import("@/pages/dashboard/admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const AuthFallback = () => (
  <div className="min-h-screen flex bg-white">
    <div className="hidden lg:block lg:w-[52%] bg-stone-900 animate-pulse" />
    <div className="w-full lg:w-[48%] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse mt-6" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

function ProtectedRoute({ component: Component, allowedRoles, useLayout = true }: { component: any; allowedRoles?: string[]; useLayout?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    return <Redirect to={user.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker"} />;

  }

  if (useLayout) {
    return (
      <DashboardLayout>
        <Component />
      </DashboardLayout>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        {/* ── Public marketing pages ─────────────────────────────────── */}
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/employers" component={EmployersPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/jobs" component={JobsList} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/privacy">{() => <LegalPage type="privacy" />}</Route>
        <Route path="/terms">{() => <LegalPage type="terms" />}</Route>
        <Route path="/cookies">{() => <LegalPage type="cookies" />}</Route>
        <Route path="/cookie-settings"><CookieSettingsPage /></Route>
        <Route path="/developers/api"><ApiReferencePage /></Route>
        <Route path="/developers"><DevelopersPage /></Route>

        {/* ── Auth pages — isolated boundary so a crash doesn't wipe the whole app ── */}
        <Route path="/auth/login">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<AuthFallback />}><Login /></Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/auth/signup">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<AuthFallback />}><Signup /></Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/auth/forgot-password" component={ForgotPassword} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/auth/verify-email" component={VerifyEmail} />
        <Route path="/auth/oauth/callback" component={OAuthCallback} />
        <Route path="/auth/magic-link/verify" component={MagicLinkVerify} />
        <Route path="/auth/verify-email-change" component={VerifyEmailChange} />

        {/* ── Onboarding ─────────────────────────────────────────────── */}
        <Route path="/onboarding/jobseeker">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={JobSeekerOnboarding} allowedRoles={["job_seeker"]} useLayout={false} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/onboarding/employer">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={EmployerOnboarding} allowedRoles={["employer"]} useLayout={false} />
            </ErrorBoundary>
          )}
        </Route>

        {/* ── Job seeker dashboard — isolated boundary ───────────────── */}
        <Route path="/dashboard/jobseeker">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={JobSeekerDashboard} allowedRoles={["job_seeker"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/cv-review">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={CvReview} allowedRoles={["job_seeker"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/saved-jobs">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={SavedJobsPage} allowedRoles={["job_seeker"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/applications">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={ApplicationsPage} allowedRoles={["job_seeker"]} />
            </ErrorBoundary>
          )}
        </Route>

        {/* ── Employer dashboard — isolated boundary ─────────────────── */}
        <Route path="/dashboard/employer">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={EmployerDashboard} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/dashboard/pipeline">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={PipelinePage} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/dashboard/jobs">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={DashboardJobs} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/jobs/new">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={PostJob} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/candidates">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={CandidatesPage} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/candidates/:id">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={CandidateProfilePage} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/messages">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={MessagesPage} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/my-jobs">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={MyJobsPage} allowedRoles={["employer"]} />
            </ErrorBoundary>
          )}
        </Route>

        {/* ── Shared protected ───────────────────────────────────────── */}
        <Route path="/profile">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={Profile} />
            </ErrorBoundary>
          )}
        </Route>

        {/* ── Admin — fully isolated boundary ────────────────────────── */}
        <Route path="/admin">
          {() => (
            <ErrorBoundary>
              <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} useLayout={false} />
            </ErrorBoundary>
          )}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <BackToTop />
            <ChatSupport />
            <CookieConsent />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
