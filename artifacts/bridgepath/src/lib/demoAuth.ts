import type { AppUser } from "./auth";

export const DEMO_KEY = "bridgepath_demo_user";
export const DEMO_APPS_KEY = "bridgepath_demo_applications";
export const DEMO_CV_KEY = "bridgepath_demo_cv";

export const DEMO_JOBSEEKER = {
  email: "jobseeker@demo.bridgepathnetwork.com",
  password: "Demo123!",
  user: {
    id: "demo-jobseeker-001",
    email: "jobseeker@demo.bridgepathnetwork.com",
    name: "Ama Boateng",
    role: "job_seeker" as const,
  } satisfies AppUser,
};

export const DEMO_EMPLOYER = {
  email: "employer@demo.bridgepathnetwork.com",
  password: "Demo123!",
  user: {
    id: "demo-employer-001",
    email: "employer@demo.bridgepathnetwork.com",
    name: "Kofi Mensah",
    role: "employer" as const,
  } satisfies AppUser,
};

export function findDemoAccount(email: string, password: string): AppUser | null {
  const e = email.trim().toLowerCase();
  if (e === DEMO_JOBSEEKER.email && password === DEMO_JOBSEEKER.password) return DEMO_JOBSEEKER.user;
  if (e === DEMO_EMPLOYER.email && password === DEMO_EMPLOYER.password) return DEMO_EMPLOYER.user;
  return null;
}

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === DEMO_JOBSEEKER.email || e === DEMO_EMPLOYER.email;
}

export function getStoredDemoUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export function setStoredDemoUser(user: AppUser) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(user));
}

export function clearDemoStorage() {
  localStorage.removeItem(DEMO_KEY);
  localStorage.removeItem(DEMO_APPS_KEY);
  localStorage.removeItem(DEMO_CV_KEY);
}

export type DemoApplication = {
  id: number;
  job: { title: string; employer: { name: string } };
  status: "applied" | "shortlisted" | "reviewing" | "rejected" | "accepted";
  createdAt: string;
};

export function getDemoApplications(): DemoApplication[] {
  try {
    const raw = localStorage.getItem(DEMO_APPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DemoApplication[];
  } catch {
    return [];
  }
}

export function addDemoApplication(app: DemoApplication) {
  const all = getDemoApplications();
  if (all.some((a) => a.id === app.id)) return;
  all.unshift(app);
  localStorage.setItem(DEMO_APPS_KEY, JSON.stringify(all));
}

export type DemoCv = {
  fileName: string;
  uploadedAt: string;
  text?: string;
  aiScore: number;
  summary: string;
};

export function getDemoCv(): DemoCv | null {
  try {
    const raw = localStorage.getItem(DEMO_CV_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoCv;
  } catch {
    return null;
  }
}

export function setDemoCv(cv: DemoCv) {
  localStorage.setItem(DEMO_CV_KEY, JSON.stringify(cv));
}
