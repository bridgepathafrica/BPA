const CONSENT_KEY = "bridgepath_cookie_consent";
export type ConsentValue = "all" | "essential";

export function useCookieConsent(): ConsentValue | null {
  const stored = typeof window !== "undefined"
    ? (localStorage.getItem(CONSENT_KEY) as ConsentValue | null)
    : null;
  return stored;
}

export { CONSENT_KEY };
