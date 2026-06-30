const STORE_KEY = "bridgepath_interviews";

export interface ScheduledInterview {
  candidateId: string;
  candidateName: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  notes: string;
  scheduledAt: string;
}

function load(): Record<string, ScheduledInterview> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function save(store: Record<string, ScheduledInterview>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function scheduleInterview(interview: ScheduledInterview) {
  const store = load();
  store[interview.candidateId] = interview;
  save(store);
}

export function getInterview(candidateId: string): ScheduledInterview | null {
  return load()[candidateId] ?? null;
}

export function getInterviewByName(name: string): ScheduledInterview | null {
  const store = load();
  return Object.values(store).find((i) => i.candidateName === name) ?? null;
}

export function cancelInterview(candidateId: string) {
  const store = load();
  delete store[candidateId];
  save(store);
}
