export type ProfileRow = {
  id: string;
  role: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  skills: string[] | null;
  experience: string | null;
  education: string | null;
  linkedin_url: string | null;
  company_name: string | null;
  company_website: string | null;
  industry: string | null;
  company_size: string | null;
  preferences: Record<string, unknown> | null;
  onboarding_completed_at: string | null;
};

const API_BASE = "/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("bridgepath_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  try {
    const res = await fetch(`${API_BASE}/profiles/${userId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: String(data.userId ?? userId),
      role: data.role ?? "job_seeker",
      full_name: data.fullName ?? null,
      bio: data.bio ?? null,
      location: data.location ?? null,
      country: data.country ?? null,
      skills: Array.isArray(data.skills) ? data.skills : null,
      experience: data.experience ?? null,
      education: data.education ?? null,
      linkedin_url: data.linkedinUrl ?? null,
      company_name: data.companyName ?? null,
      company_website: data.companyWebsite ?? null,
      industry: data.industry ?? null,
      company_size: data.companySize ?? null,
      preferences: data.preferences ?? null,
      onboarding_completed_at: data.onboardingCompletedAt ?? null,
    };
  } catch {
    return null;
  }
}

export async function upsertProfile(partial: Partial<ProfileRow> & { id: string }) {
  const userId = partial.id;
  const body: Record<string, unknown> = {};
  if (partial.bio !== undefined) body.bio = partial.bio;
  if (partial.location !== undefined) body.location = partial.location;
  if (partial.country !== undefined) body.country = partial.country;
  if (partial.skills !== undefined) body.skills = partial.skills;
  if (partial.experience !== undefined) body.experience = partial.experience;
  if (partial.education !== undefined) body.education = partial.education;
  if (partial.linkedin_url !== undefined) body.linkedinUrl = partial.linkedin_url;
  if (partial.company_name !== undefined) body.companyName = partial.company_name;
  if (partial.company_website !== undefined) body.companyWebsite = partial.company_website;
  if (partial.industry !== undefined) body.industry = partial.industry;
  if (partial.company_size !== undefined) body.companySize = partial.company_size;
  if (partial.preferences !== undefined) body.preferences = partial.preferences;
  if (partial.onboarding_completed_at !== undefined) body.onboardingCompletedAt = partial.onboarding_completed_at;

  const res = await fetch(`${API_BASE}/profiles/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Failed to update profile");
  }
}
