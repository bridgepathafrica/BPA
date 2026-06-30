import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Full URL for a path under the Vite `base` (works on Netlify root or subpath). */
export function absoluteAppUrl(path: string): string {
  const segment = path.replace(/^\//, "");
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return new URL(segment, `${window.location.origin}${root}`).href;
}

/** History pathname under Vite base, e.g. `/auth/callback`. */
export function viteBasePath(segment: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return new URL(segment.replace(/^\//, ""), `http://localhost${root}`).pathname;
}
